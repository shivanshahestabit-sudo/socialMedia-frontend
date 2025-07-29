import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import BaseUrl from "apis/baseUrl";

const AdminComponent = () => {
  const theme = useTheme();
  const mode = useSelector((state) => state.mode);
  const token = useSelector((state) => state.token);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);

  const dummyUsers = [
    {
      _id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "user",
      picturePath: null,
      createdAt: "2024-01-15T10:30:00Z",
      isActive: true,
    },
    {
      _id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com",
      role: "user",
      picturePath: null,
      createdAt: "2024-02-20T14:45:00Z",
      isActive: true,
    },
    {
      _id: "3",
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob.johnson@example.com",
      role: "admin",
      picturePath: null,
      createdAt: "2024-01-10T09:15:00Z",
      isActive: false,
    },
    {
      _id: "4",
      firstName: "Alice",
      lastName: "Williams",
      email: "alice.williams@example.com",
      role: "user",
      picturePath: null,
      createdAt: "2024-03-05T16:20:00Z",
      isActive: true,
    },
    {
      _id: "5",
      firstName: "Charlie",
      lastName: "Brown",
      email: "charlie.brown@example.com",
      role: "user",
      picturePath: null,
      createdAt: "2024-02-28T11:10:00Z",
      isActive: true,
    },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BaseUrl}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setUserCount(data.count);
      } else {
        throw new Error("Failed to fetch users");
      }

      // Simulate API delay
      //   await new Promise((resolve) => setTimeout(resolve, 1000));

      //   setUsers(dummyUsers);
      //   setUserCount(dummyUsers.length);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers(dummyUsers);
      setUserCount(dummyUsers.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        backgroundColor:
          mode === "dark" ? theme.palette.background.alt : "#fff",
        borderRadius: "0.75rem",
        padding: "2rem",
        boxShadow: theme.shadows[3],
      }}
    >
      {/* Header with user count */}
      <Box mb={3} textAlign="center">
        <Typography
          variant="h4"
          fontWeight="bold"
          color={theme.palette.primary.main}
          mb={1}
        >
          User Management Dashboard
        </Typography>
        <Box
          display="inline-flex"
          alignItems="center"
          gap={1}
          padding="0.5rem 1rem"
          backgroundColor={
            mode === "dark"
              ? theme.palette.background.default
              : theme.palette.grey[100]
          }
          borderRadius="1rem"
        >
          <Typography variant="h6" fontWeight="600">
            Total Users:
          </Typography>
          <Chip
            label={userCount}
            color="primary"
            variant="filled"
            sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
          />
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          backgroundColor:
            mode === "dark" ? theme.palette.background.default : "#fff",
          boxShadow: theme.shadows[2],
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor:
                  mode === "dark"
                    ? theme.palette.primary.dark
                    : theme.palette.primary.light,
              }}
            >
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                User
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                Joined Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user._id}
                sx={{
                  "&:hover": {
                    backgroundColor:
                      mode === "dark"
                        ? theme.palette.background.alt
                        : theme.palette.grey[50],
                  },
                }}
              >
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box>
                      <Typography variant="body2" fontWeight="600">
                        {user.firstName} {user.lastName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {user.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={user.role === "admin" ? "secondary" : "default"}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatDate(user.createdAt)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {users.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No users found
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AdminComponent;
