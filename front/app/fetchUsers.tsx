import axios from "axios";
import getApiUrl from '@/constants/endpoints';
type Employee = {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: string;
  image: string;
};
const fetchUsers = async ( token:string, logout:()=>void,   setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
) => {
  try {
    const res = await axios.get(`${getApiUrl("users")}`
, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = res.data;
   
      setEmployees(data);
    
  } catch (err:any) {
    console.error("Error fetching users:", err);
    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      logout();
    }
  }
};

export default fetchUsers;
