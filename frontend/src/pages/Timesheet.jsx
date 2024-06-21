import React, { useEffect, useState } from "react";
import { useMode } from "../components/ColorTheme";
import "../resources/Timesheet.css";
import {
  Box,
  ThemeProvider,
  TextField,
  MenuItem,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  Typography,
} from "@mui/material";
import axios from "axios";

const TimesheetPage = () => {
  const [theme] = useMode();

  //Year Variables
  const currentYear = new Date().getFullYear();
  const lastFiveYears = Array.from(
    { length: 5 },
    (_, index) => currentYear - index
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);

  //Month Variables
  const currentMonth = new Date().getMonth() + 1;
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDayNameAndDate = (day) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return (
      <>
        {dayName}
        <br />
        {day}
      </>
    );
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  function isWeekend(day) {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    const dayOfWeek = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    return dayOfWeek === 0 || dayOfWeek === 6; // Saturday or Sunday
  }

  //Filters Variables
  const [selectedName, setSelectedName] = useState("All");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedAgency, setSelectedAgency] = useState("All");

  const [employeeNames, setEmployeeNames] = useState([]);
  const [employeeTeam, setEmployeeTeam] = useState([]);
  const [employeeRole, setEmployeeRole] = useState([]);
  const [employeeAgency, setEmployeeAgency] = useState([]);

  //Table Data Array
  const [employeeWorkingHours, setEmployeeWorkingHours] = useState([]);

  //Table Data Edit Variables
  const [editingCell, setEditingCell] = useState(null);
  const [newWorkingHours, setNewWorkingHours] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch employee profile data
        const responseUserProfiles = await axios.get(
          "https://hubv2.cyienteurope.com/api/UserProfiles"
        );

        // Table filters
        const fetchedDataEmployeeNames = responseUserProfiles.data.map(
          (item) => `${item.fname} ${item.sname}`
        );
        setEmployeeNames(fetchedDataEmployeeNames);

        const fetchedDataEmployeeTeam = responseUserProfiles.data.map(
          (item) => `${item.team}`
        );
        const uniqueEmployeeTeam = [...new Set(fetchedDataEmployeeTeam)];
        setEmployeeTeam(uniqueEmployeeTeam);

        const fetchedDataEmployeeRole = responseUserProfiles.data.map(
          (item) => `${item.role}`
        );
        const uniqueEmployeeRole = [...new Set(fetchedDataEmployeeRole)];
        setEmployeeRole(uniqueEmployeeRole);

        const fetchedDataEmployeeAgency = responseUserProfiles.data.map(
          (item) => `${item.agency}`
        );
        const uniqueEmployeeAgency = [...new Set(fetchedDataEmployeeAgency)];
        setEmployeeAgency(uniqueEmployeeAgency);

        const baseEmployeeData = responseUserProfiles.data.map((item) => ({
          Name: `${item.fname} ${item.sname}`,
          AutoID: item.AUTOID,
          Team: item.team,
          Role: item.role,
          Agency: item.agency,
          ...Array.from({ length: daysInMonth }, (_, i) => ({
            [`Day ${i + 1} Working Hours`]: "-",
          })).reduce((acc, day) => ({ ...acc, ...day }), {}),
        }));

        // Fetch timesheet data
        const responseTimesheet = await axios.get(
          "https://hubv2.cyienteurope.com/api/Timesheet"
        );

        const filteredData = responseTimesheet.data.filter((item) => {
          const timeSheetDate = new Date(item.work_date);
          const matchesDate =
            timeSheetDate.getFullYear() === selectedYear &&
            timeSheetDate.getMonth() + 1 === selectedMonth;
          const matchesName =
            selectedName === "All" ||
            `${item.fname} ${item.sname}` === selectedName;
          const matchesRole =
            selectedRole === "All" || item.role === selectedRole;
          const matchesTeam =
            selectedTeam === "All" || item.team === selectedTeam;
          const matchesAgency =
            selectedAgency === "All" || item.agency === selectedAgency;
          return (
            matchesDate &&
            matchesName &&
            matchesRole &&
            matchesTeam &&
            matchesAgency
          );
        });

        filteredData.forEach((item) => {
          const timeSheetDate = new Date(item.work_date);

          const employee = baseEmployeeData.find(
            (emp) => emp.AutoID === item.employee_id
          );
          if (employee) {
            const dayOfMonth = timeSheetDate.getDate();

            // Set H for Holiday, S for Sick Leave, or if it's a normal working day
            switch (item.category) {
              case null:
                employee[`Day ${dayOfMonth} Working Hours`] = item.hours;
                break;
              case "1":
                employee[`Day ${dayOfMonth} Working Hours`] = "H";
                break;
              case "2":
                employee[`Day ${dayOfMonth} Working Hours`] = "S";
                break;
              default:
                break;
            }
          }
        });

        const filteredRows = baseEmployeeData.filter((item) => {
          const matchesName =
            selectedName === "All" || item.Name === selectedName;
          const matchesRole =
            selectedRole === "All" || item.Role === selectedRole;
          const matchesTeam =
            selectedTeam === "All" || item.Team === selectedTeam;
          const matchesAgency =
            selectedAgency === "All" || item.Agency === selectedAgency;
          return matchesName && matchesRole && matchesTeam && matchesAgency;
        });

        // Set filtered rows to the table variable
        setEmployeeWorkingHours(filteredRows);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    // Refresh the table if any filter is changed.
    selectedMonth,
    selectedYear,
    selectedName,
    selectedRole,
    selectedTeam,
    selectedAgency,
  ]);

  // Function to handle opening the popup box
  const handleCellClick = (employeeId, day) => {
    setEditingCell({ employeeId, day });
    setNewWorkingHours(
      employeeWorkingHours.find((employee) => employee.AutoID === employeeId)[
        `Day ${day} Working Hours`
      ] || ""
    );
  };

  // Function to handle updating working hours and closing the popup box
  const handleUpdateWorkingHours = async () => {
    const updatedEmployeeWorkingHours = [...employeeWorkingHours];
    const index = updatedEmployeeWorkingHours.findIndex(
      (employee) => employee.AutoID === editingCell.employeeId
    );
    updatedEmployeeWorkingHours[index][`Day ${editingCell.day} Working Hours`] =
      newWorkingHours;
    setEmployeeWorkingHours(updatedEmployeeWorkingHours);

    // Update holidays and sickdays
    const employeeId = editingCell.employeeId;
    const selectedDate = `${selectedYear}-${String(selectedMonth).padStart(
      2,
      "0"
    )}-${String(editingCell.day).padStart(2, "0")} 00:00:00.0000000`;
    const changedBy = "dasni-development";
    const nowDateAndTime = new Date();
    const dateOfChange = `${nowDateAndTime.getFullYear()}-${String(
      nowDateAndTime.getMonth() + 1
    ).padStart(2, "0")}-${String(nowDateAndTime.getDate()).padStart(
      2,
      "0"
    )} ${String(nowDateAndTime.getHours()).padStart(2, "0")}:${String(
      nowDateAndTime.getMinutes()
    ).padStart(2, "0")}:${String(nowDateAndTime.getSeconds()).padStart(
      2,
      "0"
    )}.${String(nowDateAndTime.getMilliseconds()).padStart(7, "0")}`;
    const userId = "dasni-development";

    try {
      const response = await fetch(
        "https://hubv2.cyienteurope.com/api/updateEmployeeHours",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeeId,
            selectedDate,
            newWorkingHours,
            changedBy,
            dateOfChange,
            userId,
          }),
        }
      );
      if (response.ok) {
        console.log("Successfully updated employee hours");
      } else {
        console.error("Failed to update employee hours");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setEditingCell(null);
    setNewWorkingHours("");
  };

  const fieldStyle = {
    width: "150px",
    marginRight: "10px",
    marginBottom: "10px",
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className="timesheet-container">
        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <h2
              className="timesheet-heading-1"
              style={{ margin: 0, marginLeft: "100px" }}
            >
              TIMESHEET
            </h2>
            <h3
              className="timesheet-heading-2"
              style={{ margin: 0, marginLeft: "10px", textTransform: "uppercase"}}
            >
              {`${monthNames[selectedMonth - 1]}, ${selectedYear}`}
            </h3>
          </div>

          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            flexGrow={1}
          >
            <TextField
              style={fieldStyle}
              select
              label="Name"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              variant="outlined"
            >
              <MenuItem key="All" value="All">
                All
              </MenuItem>
              {employeeNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              style={fieldStyle}
              select
              label="Role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              variant="outlined"
            >
              <MenuItem key="All" value="All">
                All
              </MenuItem>
              {employeeRole.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              style={fieldStyle}
              select
              label="Team"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              variant="outlined"
            >
              <MenuItem key="All" value="All">
                All
              </MenuItem>
              {employeeTeam.map((team) => (
                <MenuItem key={team} value={team}>
                  {team}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              style={fieldStyle}
              select
              label="Agency"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              variant="outlined"
            >
              <MenuItem key="All" value="All">
                All
              </MenuItem>
              {employeeAgency.map((agency) => (
                <MenuItem key={agency} value={agency}>
                  {agency}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              style={fieldStyle}
              select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              variant="outlined"
            >
              {lastFiveYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              style={fieldStyle}
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              variant="outlined"
            >
              {months.map((month) => (
                <MenuItem key={month} value={month}>
                  {new Date(0, month - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 650 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    style={{ minWidth: 130, backgroundColor: "#f2f2f2" }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ minWidth: 100, backgroundColor: "#f2f2f2" }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ minWidth: 100, backgroundColor: "#f2f2f2" }}
                  >
                    Team
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ minWidth: 100, backgroundColor: "#f2f2f2" }}
                  >
                    Agency
                  </TableCell>
                  {[...Array(daysInMonth).keys()].map((day) => (
                    <TableCell
                      key={day}
                      align="center"
                      style={{ minWidth: 10, backgroundColor: "#f2f2f2" }}
                    >
                      {getDayNameAndDate(day + 1)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {employeeWorkingHours.map((employee, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                    <TableCell align="left">{employee.Name}</TableCell>
                    <TableCell align="center">{employee.Role}</TableCell>
                    <TableCell align="center">{employee.Team}</TableCell>
                    <TableCell align="center">{employee.Agency}</TableCell>
                    {[...Array(daysInMonth).keys()].map((day) => (
                      <TableCell
                        key={day}
                        align="center"
                        className={`timesheet-table-cell ${
                          isWeekend(day + 1)
                            ? "timesheet-table-cell-weekend"
                            : ""
                        } ${
                          employee[`Day ${day + 1} Working Hours`] === "H"
                            ? "timesheet-table-cell-H"
                            : employee[`Day ${day + 1} Working Hours`] === "S"
                            ? "timesheet-table-cell-S"
                            : ""
                        }`}
                        onClick={() =>
                          handleCellClick(employee.AutoID, day + 1)
                        }
                      >
                        {editingCell &&
                        editingCell.employeeId === employee.AutoID &&
                        editingCell.day === day + 1 ? (
                          <TextField
                            value={newWorkingHours}
                            onChange={(e) => setNewWorkingHours(e.target.value)}
                            fullWidth
                            autoFocus
                          />
                        ) : employee[`Day ${day + 1} Working Hours`] === "8" ||
                          employee[`Day ${day + 1} Working Hours`] === "8.0" ? (
                          "✓"
                        ) : (
                          employee[`Day ${day + 1} Working Hours`] || "-"
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog
          open={!!editingCell}
          onClose={() => setEditingCell(null)}
          className="timesheet-dialog"
        >
          <DialogTitle className="timesheet-dialog-title">
            Edit Working Hours
          </DialogTitle>
          <DialogContent className="timesheet-dialog-content">
            <Select
              label="Working Hours"
              value={newWorkingHours}
              onChange={(e) => setNewWorkingHours(e.target.value)}
              fullWidth
            >
              <MenuItem value="H">H</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="-">-</MenuItem>
              {(() => {
                const options = [];
                for (let i = 1; i <= 12; i += 0.5) {
                  options.push({
                    value: i,
                    label: i,
                  });
                }
                return options;
              })().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.value}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions className="timesheet-dialog-actions">
            <Button onClick={() => setEditingCell(null)}>Cancel</Button>
            <Button onClick={handleUpdateWorkingHours}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default TimesheetPage;
