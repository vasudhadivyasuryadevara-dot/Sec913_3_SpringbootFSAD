import React, { useState } from "react";
import "./admin.css";

const Admin = () => {

    const [selectedRole, setSelectedRole] = useState("");

    const [roleName, setRoleName] = useState("");
    const [menuName, setMenuName] = useState("");

    const [roles, setRoles] = useState([
        "User",
        "Manager",
        "Admin"
    ]);

    const [menuList, setMenuList] = useState([
        "Dashboard",
        "My Task",
        "Task Manager",
        "User Manager",
        "My Profile"
    ]);

    function addRole() {

        if (roleName !== "") {

            setRoles([...roles, roleName]);

            alert("Role Added Successfully");

            setRoleName("");
        }
        else {

            alert("Please Enter Role Name");
        }
    }

    function addMenu() {

        if (menuName !== "") {

            setMenuList([...menuList, menuName]);

            alert("Menu Added Successfully");

            setMenuName("");
        }
        else {

            alert("Please Enter Menu Name");
        }
    }

    function addMapping() {

        if (selectedRole === "") {

            alert("Please Select Role");
        }
        else {

            alert("Mapping Added Successfully");
        }
    }

    return (

        <div className="container">

            {/* Sidebar */}
            <div className="sidebar">

                <h2 className="logo">
                    Micro-Task Hub
                </h2>

                <div className="menu">Dashboard</div>
                <div className="menu">My Task</div>
                <div className="menu">Task Manager</div>
                <div className="menu">User Manager</div>
                <div className="menu">My Profile</div>

                <div className="menu activeMenu">
                    Roles
                </div>

            </div>

            {/* Main Content */}
            <div className="content">

                {/* Roles */}
                <div className="card">

                    <h2 className="heading">
                        Roles
                    </h2>

                    <div className="row">

                        <input
                            type="text"
                            placeholder="Enter role"
                            value={roleName}
                            onChange={(e) =>
                                setRoleName(e.target.value)
                            }
                            className="input"
                        />

                        <button
                            className="button"
                            onClick={addRole}
                        >
                            Add Role
                        </button>

                    </div>

                </div>

                {/* Menu */}
                <div className="card">

                    <h2 className="heading">
                        Menu
                    </h2>

                    <div className="row">

                        <input
                            type="text"
                            placeholder="Enter menu"
                            value={menuName}
                            onChange={(e) =>
                                setMenuName(e.target.value)
                            }
                            className="input"
                        />

                        <button
                            className="button"
                            onClick={addMenu}
                        >
                            Add Menu
                        </button>

                    </div>

                </div>

                {/* Mapping */}
                <div className="card">

                    <h2 className="heading">
                        Map Menu with Roles
                    </h2>

                    <select
                        value={selectedRole}
                        onChange={(e) =>
                            setSelectedRole(e.target.value)
                        }
                        className="select"
                    >

                        <option value="">
                            Select Role
                        </option>

                        {
                            roles.map((role, index) => (

                                <option key={index}>
                                    {role}
                                </option>
                            ))
                        }

                    </select>

                    <div className="checkboxContainer">

                        {
                            menuList.map((menu, index) => (

                                <div
                                    key={index}
                                    className="checkboxRow"
                                >

                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                    />

                                    <label className="label">
                                        {menu}
                                    </label>

                                </div>
                            ))
                        }

                    </div>

                    <button
                        className="button"
                        style={{ marginTop: "25px" }}
                        onClick={addMapping}
                    >
                        Add Mapping
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Admin;