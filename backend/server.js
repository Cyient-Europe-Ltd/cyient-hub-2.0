const express = require("express");
const mssql = require("mssql");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const config = {
  user: "sa",
  password: "Atlantic2017#",
  server: "192.168.125.23",
  database: "HubData",
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Create a connection pool
const pool = new mssql.ConnectionPool(config);

pool
  .connect()
  .then(() => {
    console.log("Connected to SQL Server");
  })
  .catch((err) => console.error("Database connection error:", err));

app.get("/api/UserProfiles", async (req, res) => {
  try {
    const result = await pool
      .request()
      .query(
        `SELECT * FROM UserProfiles WHERE autoid IS NOT NULL ORDER BY fname`
      );

    res.json(result.recordset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error retrieving data");
  }
});

app.get("/api/Timesheet", async (req, res) => {
  try {
    const result = await pool.request().query(
      `SELECT 
      employee_leaves.employee_id,
      employee_leaves.leave_date AS work_date,
      NULL AS hours,
      UserProfiles.fname, 
      UserProfiles.sname, 
      UserProfiles.role, 
      UserProfiles.agency,
      UserProfiles.team,
      employee_leaves.category
    FROM 
      employee_leaves
    JOIN 
      UserProfiles ON employee_leaves.employee_id = UserProfiles.AutoID
    WHERE 
      CONVERT(datetime2, employee_leaves.leave_date) >= DATEADD(year, -2, GETDATE())
      AND (employee_leaves.category = '1' OR employee_leaves.category = '2')
    UNION
    SELECT 
      mHours_Copy.autoid, 
      mHours_Copy.date, 
      mHours_Copy.hours, 
      UserProfiles.fname, 
      UserProfiles.sname, 
      UserProfiles.role, 
      UserProfiles.agency,
      UserProfiles.team,
      NULL AS category
    FROM 
      mHours_Copy
    JOIN 
      UserProfiles ON mHours_Copy.autoid = UserProfiles.AutoID
    WHERE 
      TRY_CONVERT(float, mHours_Copy.hours) != 0 
      AND mHours_Copy.date >= DATEADD(year, -5, GETDATE())`
    );
    res.json(result.recordset);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error retrieving data");
  }
});

// Update holidays and sickdays
app.post("/api/updateEmployeeHours", async (req, res) => {
  const {
    employeeId,
    selectedDate,
    newWorkingHours,
    changedBy,
    dateOfChange,
    userId,
  } = req.body;

  let hours;
  let category;
  if (newWorkingHours === 'H') {
    category = '1';
  } else if (newWorkingHours === 'S') {
    category = '2';
  } else if (1 <= newWorkingHours && newWorkingHours <= 12) {
    hours = newWorkingHours.toString();
  }

  try {
    const request = pool.request();
    request.input("employeeId", mssql.Int, employeeId);
    request.input("selectedDate", mssql.VarChar, selectedDate);
    request.input("hours", mssql.VarChar, hours);
    request.input("category", mssql.VarChar, category);
    request.input("changedBy", mssql.VarChar, changedBy);
    request.input("dateOfChange", mssql.VarChar, dateOfChange);
    request.input("userId", mssql.VarChar, userId);

    //Handle emoloyee leave updates
    if (newWorkingHours === "H" || newWorkingHours === "S") {
      const resultEmployeeLeaves = await request.query(
        "SELECT * FROM employee_leaves WHERE employee_id = @employeeId AND leave_date = @selectedDate"
      );
      if (resultEmployeeLeaves.recordset.length > 0) {
        await request.query(
          "UPDATE employee_leaves SET category = @category, changed_by = @changedBy, date_of_change = @dateOfChange WHERE employee_id = @employeeId AND leave_date = @selectedDate"
        );
      } else {
        await request.query(
          "INSERT INTO employee_leaves (employee_id, leave_date, category, changed_by, date_of_change) VALUES (@employeeId, @selectedDate, @category, @changedBy, @dateOfChange)"
        );
      }
      const resultMHours = await request.query(
        "SELECT * FROM mHours_Copy WHERE autoid = @employeeId AND Date = @selectedDate"
      );

      if (resultMHours.recordset.length > 0) {
        await request.query(
          "DELETE FROM mHours_Copy WHERE autoid = @employeeId AND Date = @selectedDate"
        );
      }
    
      //Handle employee working hour updates
    } else if (1 <= newWorkingHours && newWorkingHours <= 12) {
      const resultMHours_Copy = await request.query(
        "SELECT * FROM mHours_Copy WHERE autoid = @employeeId AND Date = @selectedDate"
      );
      if (resultMHours_Copy.recordset.length > 0) {
        await request.query(
          "UPDATE mHours_Copy SET UserID = @userId, hours = @hours WHERE autoid = @employeeId AND Date = @selectedDate"
        );
      } else {
        await request.query(
          "INSERT INTO mHours_Copy (UserID, Date, hours, autoid) VALUES (@userId, @selectedDate, @hours, @employeeId)"
        );
      }
      const resultemployee_leaves = await request.query(
        "SELECT * FROM employee_leaves WHERE employee_id = @employeeId AND leave_date = @selectedDate"
      );

      if (resultemployee_leaves.recordset.length > 0) {
        await request.query(
          "DELETE FROM employee_leaves WHERE employee_id = @employeeId AND leave_date = @selectedDate"
        );
      }

    //Handle employee working hour removels
    }else if (newWorkingHours === '-') {
      const resultMHours = await request.query(
        "SELECT * FROM mHours_Copy WHERE autoid = @employeeId AND Date = @selectedDate"
      );

      if (resultMHours.recordset.length > 0) {
        await request.query(
          "DELETE FROM mHours_Copy WHERE autoid = @employeeId AND Date = @selectedDate"
        );
      }
      const resultemployee_leaves = await request.query(
        "SELECT * FROM employee_leaves WHERE employee_id = @employeeId AND leave_date = @selectedDate"
      );

      if (resultemployee_leaves.recordset.length > 0) {
        await request.query(
          "DELETE FROM employee_leaves WHERE employee_id = @employeeId AND leave_date = @selectedDate"
        );
      }
    }

    res.status(200).send("Success");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating employee hours");
  }
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
