"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Database,
  BarChart3,
  Plus,
  Check,
  AlertCircle,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
  role: string | null;
  status: boolean;
}

export default function AdminControls() {
  const { isAdmin } = useAuth();
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateUserWithPassword, setShowCreateUserWithPassword] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "lead">("lead");
  const [newCountry, setCountry] = useState<"United Kingdom" | "United States of America" | "Ireland">("United States of America");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [createUserError, setCreateUserError] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Delete user states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const pageRange = 10; // Show only 10 page numbers

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);

      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data);
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsersError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };


  // Update user status
  const updateUserStatus = async (userId: string, status: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update user status");
      }

      // Update local state
      setUsers(users.map(user =>
        user.user_id === userId ? { ...user, status } : user
      ));

      showToast(`User status updated to ${status ? "Paid" : "Unpaid"}`, "success");
    } catch (err) {
      console.error("Error updating user status:", err);
      showToast(err instanceof Error ? err.message : "Failed to update user status", "error");
    }
  };

  // Load users on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail || !newUserRole || !newCountry) {
      setCreateUserError("Please fill in all fields");
      return;
    }

    setIsCreatingUser(true);
    setCreateUserError("");

    try {
      const response = await fetch("/api/admin/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newUserEmail, role: newUserRole, country: newCountry }),
      });

      const result = await response.json();

      if (!response.ok) {
        setCreateUserError(result.error || "Failed to create user");
        return;
      }

      // Success → close modal + toast
      setShowCreateUser(false);
      setNewUserEmail("");
      setNewUserRole("lead");
      setCountry("United States of America");
      showToast(result.message || `Invite sent to ${newUserEmail}`, "success");

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error(err);
      setCreateUserError("Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Reset create user form
  const resetCreateUserForm = () => {
    setShowCreateUser(false);
    setNewUserEmail("");
    setNewUserRole("lead");
    setCreateUserError("");
  };

  // Create new user with password
  const handleCreateUserWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserEmail || !newUserPassword || !newUserRole || !newCountry) {
      setCreateUserError("Please fill in all fields");
      return;
    }

    setIsCreatingUser(true);
    setCreateUserError("");

    try {
      const response = await fetch("/api/admin/createUserWithPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          country: newCountry
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setCreateUserError(result.error || "Failed to create user");
        return;
      }

      // Success → close modal + toast
      setShowCreateUserWithPassword(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("lead");
      setCountry("United States of America");
      showToast(result.message || "User created successfully", "success");

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error(err);
      setCreateUserError("Failed to create user");
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Reset create user with password form
  const resetCreateUserWithPasswordForm = () => {
    setShowCreateUserWithPassword(false);
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("lead");
    setCreateUserError("");
    setShowPassword(false);
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.user_id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      // Update local state
      setUsers(users.filter(user => user.user_id !== userToDelete.user_id));
      showToast("User deleted successfully", "success");
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast(err instanceof Error ? err.message : "Failed to delete user", "error");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const confirmDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Calculate visible page range (only show 10 pages)
  const getPageRange = () => {
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(pageRange / 2), totalPages - pageRange + 1));
    const endPage = Math.min(totalPages, startPage + pageRange - 1);
    return { startPage, endPage };
  };

  const { startPage, endPage } = getPageRange();

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Handle rows per page change
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRowsPerPage = parseInt(e.target.value);
    setUsersPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Controls
          </h1>
          <p className="text-lg text-gray-600">
            Manage users, settings, and system configuration
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Total Users
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {users.length} total users
                <span className="text-gray-500">(excluding admins)</span>
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Paid Users
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {users.filter(user => user.status === true).length} paid users
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Users className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Unpaid Users
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {users.filter(user => user.status === false).length} unpaid users
              </p>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  User Management
                </h3>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={fetchUsers}
                  disabled={loadingUsers}
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${loadingUsers ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </button>
                <button
                  onClick={() => setShowCreateUserWithPassword(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ml-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create User with Password
                </button>
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions. Create new users and
              assign admin or lead roles.
            </p>

            {/* Users Table */}
            <div className="mt-6">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              ) : usersError ? (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        Error loading users: {usersError}
                      </p>
                      <button
                        onClick={fetchUsers}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <label htmlFor="rows-per-page" className="mr-2 text-sm text-gray-700">
                          Rows per page:
                        </label>
                        <select
                          id="rows-per-page"
                          value={usersPerPage}
                          onChange={handleRowsPerPageChange}
                          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                        </select>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                          }}
                          className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            S. No.
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          currentUsers.map((user, index) => (
                            <tr key={user.user_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {indexOfFirstUser + index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                      <span className="text-blue-800 font-medium">
                                        {user.email.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {user.full_name || "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "lead"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                  }`}>
                                  {user.role || "N/A"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={user.status ? "paid" : "unpaid"}
                                  onChange={(e) => updateUserStatus(user.user_id, e.target.value === "paid")}
                                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                  <option value="paid">Paid</option>
                                  <option value="unpaid">Unpaid</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.created_at
                                  ? new Date(user.created_at).toLocaleDateString()
                                  : "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => confirmDeleteUser(user)}
                                  className="text-red-600 hover:text-red-900 focus:outline-none"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {users.length > usersPerPage && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <button
                          onClick={prevPage}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={nextPage}
                          disabled={currentPage === totalPages}
                          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div className="flex items-center">
                          <p className="text-sm text-gray-700 mr-4">
                            Showing <span className="font-medium">{filteredUsers.length > 0 ? indexOfFirstUser + 1 : 0}</span> to{' '}
                            <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> of{' '}
                            <span className="font-medium">{filteredUsers.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                              onClick={prevPage}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                              <span className="sr-only">Previous</span>
                              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {startPage > 1 && (
                              <>
                                <button
                                  onClick={() => paginate(1)}
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                >
                                  1
                                </button>
                                {startPage > 2 && (
                                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                    ...
                                  </span>
                                )}
                              </>
                            )}
                            {[...Array(endPage - startPage + 1)].map((_, i) => {
                              const pageNumber = startPage + i;
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => paginate(pageNumber)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                    ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                    }`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            })}
                            {endPage < totalPages && (
                              <>
                                {endPage < totalPages - 1 && (
                                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                    ...
                                  </span>
                                )}
                                <button
                                  onClick={() => paginate(totalPages)}
                                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                >
                                  {totalPages}
                                </button>
                              </>
                            )}
                            <button
                              onClick={nextPage}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                              <span className="sr-only">Next</span>
                              <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Create User Form Modal */}
            {showCreateUser && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Create New User
                    </h3>
                    <button
                      onClick={resetCreateUserForm}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label
                          htmlFor="user-email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email address
                        </label>
                        <input
                          id="user-email"
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter user email"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="user-role"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Role
                        </label>
                        <select
                          id="user-role"
                          value={newUserRole}
                          onChange={(e) =>
                            setNewUserRole(e.target.value as "admin" | "lead")
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="lead">Lead</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="user-role"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Country
                        </label>
                        <select
                          id="user-country"
                          value={newCountry}
                          onChange={(e) =>
                            setCountry(e.target.value as "United States of America" | "United Kingdom" | "Ireland")
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="United States of America">United States of America</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Ireland">Ireland</option>
                        </select>
                      </div>

                      {createUserError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <p className="text-sm text-red-700">
                                {createUserError}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={resetCreateUserForm}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingUser || !newUserEmail}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingUser ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </div>
                          ) : (
                            "Create User"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Create User With Password Form Modal */}
            {showCreateUserWithPassword && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      Create New User with Password
                    </h3>
                    <button
                      onClick={resetCreateUserWithPasswordForm}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleCreateUserWithPassword} className="space-y-4">
                      <div>
                        <label
                          htmlFor="user-email-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email address
                        </label>
                        <input
                          id="user-email-password"
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter user email"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="user-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Password
                        </label>
                        <div className="relative mt-1">
                          <input
                            id="user-password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                            placeholder="Enter user password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" aria-hidden="true" />
                            ) : (
                              <Eye className="h-5 w-5" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="user-role-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Role
                        </label>
                        <select
                          id="user-role-password"
                          value={newUserRole}
                          onChange={(e) =>
                            setNewUserRole(e.target.value as "admin" | "lead")
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="lead">Lead</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="user-country-password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Country
                        </label>
                        <select
                          id="user-country-password"
                          value={newCountry}
                          onChange={(e) =>
                            setCountry(e.target.value as "United States of America" | "United Kingdom" | "Ireland")
                          }
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="United States of America">United States of America</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Ireland">Ireland</option>
                        </select>
                      </div>

                      {createUserError && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <p className="text-sm text-red-700">
                                {createUserError}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={resetCreateUserWithPasswordForm}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isCreatingUser || !newUserEmail || !newUserPassword}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingUser ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </div>
                          ) : (
                            "Create User"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && userToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
                  Delete User
                </h3>
                <p className="text-sm text-center text-gray-500 mb-6">
                  Are you sure you want to delete <strong>{userToDelete.email}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isDeletingUser}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeletingUser ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                User Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Manage user accounts, roles, and permissions. Add new users and
              assign admin or lead roles.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Database Management
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Monitor database performance, manage data imports, and configure
              database settings.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Analytics Configuration
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure analytics dashboards, set up automated reports, and
              customize data views.
            </p>
            <div className="text-sm text-gray-500">Coming soon...</div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need admin assistance? Contact your system administrator for help
            with user management and system configuration.
          </p>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`rounded-md p-4 shadow-lg ${toast.type === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
                }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {toast.type === "success" ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm ${toast.type === "success"
                      ? "text-green-700"
                      : "text-red-700"
                      }`}
                  >
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}