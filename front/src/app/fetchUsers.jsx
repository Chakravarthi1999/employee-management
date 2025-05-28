import axios from "axios";
  import getApiUrl from '@/constants/endpoints';
const fetchUsers = async ( token, logout, setEmployees) => {
  // const endpoint = isAdmin ? "" : "employees";
  try {
    const res = await axios.get(`${getApiUrl("users")}`
, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data;
    // if (isAdmin) {
    //   setAdmins(data.filter((u) => u.role === "admin"));
    //   setEmployees(data.filter((u) => u.role === "employee"));
    // } else {
      setEmployees(data);
    
  } catch (err) {
    console.error("Error fetching users:", err);
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      logout();
    }
  }
};

export default fetchUsers;
