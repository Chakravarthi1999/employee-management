"use client"
import React, { useContext,useEffect,useState } from 'react'; 
 import { FiBell } from "react-icons/fi"; 
import { useRouter } from 'next/navigation';
import AuthContext from '@/context/AuthContext';
import Link from 'next/link';
  import getApiUrl from '@/constants/endpoints';
import Notifications from './notifications';
// import Notifications from '@/app/notifications/page';
// import Notifications from '../notifications/page';

const Navbar = () => {
const router=useRouter()
  const { user,logout,loading } = useContext(AuthContext);
     const [showNotifications, setShowNotifications] = useState(false);
    const [userrole,setUserrole]=useState("");
    
  useEffect(() => {
   if (!loading) { 
    if (!user) 
      router.push("/");
     else 
      setUserrole(user.role);
    }
  }, [user]);

   if (!user) return null; 
  

return (
    <nav className="navbar">
      <div className="navbar-left">
        {user.image && (
          <img
            src={`${getApiUrl("uploads")}/${user.image}`}
            alt="Profile"
            className="profile-pic"
          />
        )}
                <Link href="dashboard" className="nav-btn">Dashboard</Link>
        <Link href="profile" className="nav-btn">My Profile</Link>

      </div>

     

      <div className="navbar-right">
       {userrole === "admin"&&(
        <>
        <Link href="add-employee" className="nav-btn">Add Employee</Link>
               <Link href="manage-notifications" className="nav-btn">Manage Notifications</Link>
        <Link href="CompanyBanners" className="nav-btn">Company Banners</Link>

       </>)} 
        {!(userrole === "admin")&&(<>
        <button className="nav-btn" onClick={() => setShowNotifications(!showNotifications)}>
        <FiBell size={24} />
      </button>

       {showNotifications && <Notifications onClose={() => setShowNotifications(false)} />} 
    </>
       )} 
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
