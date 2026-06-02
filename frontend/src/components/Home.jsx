import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { apibaseurl, callApi, imgurl } from '../lib';
import ProgressBar from './ProgressBar';

const Home = () => {
    const [fullname, setFullname] = useState("");
    const [userRole, setUserRole] = useState("");
    const [userMenus, setUserMenus] = useState([]);
    const [isProgress, setIsProgress] = useState("");
    const [activeMenu, setActiveMenu] = useState("Roles");
    const [roleName, setRoleName] = useState("");
    const [menuName, setMenuName] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedMenus, setSelectedMenus] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [menus, setMenus] = useState([]);
    const [roleMappings, setRoleMappings] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [taskName, setTaskName] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [taskAssignedto, setTaskAssignedto] = useState("");
    const [selectedTaskId, setSelectedTaskId] = useState("");
    const [taskDate, setTaskDate] = useState("");
    const [taskHours, setTaskHours] = useState("");
    const [taskMinutes, setTaskMinutes] = useState("");
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [projectMappedto, setProjectMappedto] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const navigate = useNavigate();
    const defaultSideMenus = [
        { menu: "Dashboard", icon: "dashboard.png" },
        { menu: "My Task", icon: "mytask.png" },
        { menu: "Task Manager", icon: "taskmanager.png" },
        { menu: "ProjectManager", icon: "taskmanager.png" },
        { menu: "User Manager", icon: "usermanager.png" },
        { menu: "My Profile", icon: "myprofile.png" }
    ];
    const defaultRoles = [
        { role: 1, rolename: "User" },
        { role: 2, rolename: "Manager" },
        { role: 3, rolename: "Admin" }
    ];
    const menuIcons = {
        "Dashboard": "dashboard.png",
        "My Task": "mytask.png",
        "Task Manager": "taskmanager.png",
        "ProjectManager": "taskmanager.png",
        "Project Manager": "taskmanager.png",
        "pro": "taskmanager.png",
        "User Manager": "usermanager.png",
        "My Profile": "myprofile.png"
    };
    const projectManagerTaskTemplates = [
        {
            task: "Login as Admin User - elan77@gmail.com",
            description: "Admin setup task for ProjectCoordinator workflow."
        },
        {
            task: "Create New Role - ProjectCoordinator",
            description: "Create the ProjectCoordinator role from Roles."
        },
        {
            task: "Create New Menu - ProjectManager",
            description: "Create the ProjectManager menu for project management."
        },
        {
            task: "Map Dashboard, My Task, Task Manager, ProjectManager and My Profile",
            description: "Map the required menus to the ProjectCoordinator role."
        },
        {
            task: "Register New User with ProjectCoordinator role - sec913",
            description: "Create a new user and select ProjectCoordinator as the role."
        },
        {
            task: "Sign in using sec913 credentials",
            description: "Verify the new user can login successfully."
        },
        {
            task: "Verify ProjectManager is visible in the menu list",
            description: "Confirm ProjectManager appears after signing in as the new user."
        }
    ];
    const sideMenus = userMenus.length > 0 ? userMenus : defaultSideMenus;
    const displaySideMenus = sideMenus.reduce((menuList, menuItem)=>{
        const menuRoute = getMenuRoute(menuItem.menu);
        if(menuRoute === "ProjectManager" && menuList.some((item)=>getMenuRoute(item.menu) === "ProjectManager"))
            return menuList;
        return [...menuList, {
            ...menuItem,
            menu: menuRoute,
            displayName: menuRoute === "ProjectManager" ? "ProjectManager" : menuItem.menu,
            icon: menuRoute === "ProjectManager" ? "taskmanager.png" : menuItem.icon
        }];
    }, []);
    const hasProjectManagerButton = displaySideMenus.some((m)=>m.menu === "ProjectManager");

    useEffect(()=>{
        const token = localStorage.getItem("token");
        if(!token)
            logout();
        else{
            Promise.resolve().then(() => {
                setIsProgress(true);
                callApi("GET", apibaseurl + "/authservice/uinfo", null, null, loadUinfo, token);
            });
        }
    }, []);

    useEffect(()=>{
        if(activeMenu === "User Manager" || activeMenu === "Roles"){
            loadUsers();
        }
        if(activeMenu === "Roles"){
            loadRoles();
            loadMenus();
            loadRoleMappings();
        }
        if(activeMenu === "My Task"){
            loadMyTasks();
        }
        if(activeMenu === "Task Manager"){
            loadTasks();
            loadUsers();
        }
        if(activeMenu === "ProjectManager"){
            loadProjects();
            loadUsers();
        }
    }, [activeMenu]);

    function getToken(){
        return localStorage.getItem("token") || "";
    }

    async function apiRequest(method, url, data = null){
        const headers = {};
        const token = getToken();
        if(data)
            headers["Content-Type"] = "application/json";
        if(token)
            headers["Token"] = token;

        const response = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
        });
        return response.json();
    }

    function loadUinfo(res){
        setIsProgress(false);
        if(res.code != 200)
            return;
        setFullname(res.fullname);
        setUserRole(res.role);
        const mappedMenus = (res.menulist || []).map((menu)=>({
            mid: menu.mid,
            menu: getMenuRoute(menu.menu),
            displayName: getMenuRoute(menu.menu) === "ProjectManager" ? "ProjectManager" : menu.menu,
            icon: menu.icon && menu.icon !== "default.png" ? menu.icon : (menuIcons[menu.menu] || "dashboard.png")
        }));
        setUserMenus(mappedMenus);
        if(mappedMenus.length > 0)
            setActiveMenu(getMenuRoute(mappedMenus[0].menu));
        else if(Number(res.role) === 3)
            setActiveMenu("Roles");
    }

    function logout(){
        localStorage.clear();
        window.location.replace("/");
    }

    function loadUsers(){
        setIsProgress(true);
        callApi("GET", apibaseurl + "/authservice/listusers", null, null, loadUsersResponse, getToken());
    }

    function loadUsersResponse(res){
        setIsProgress(false);
        if(res.code != 200)
            alert(res.message);
        else
            setUsers(res.users);
    }

    function loadRoles(){
        callApi("GET", apibaseurl + "/roles", null, null, loadRolesResponse, getToken());
    }

    function loadRolesResponse(res){
        if(res.code != 200)
            alert(res.message);
        else
            setRoles(res.roles || []);
    }

    function loadMenus(){
        callApi("GET", apibaseurl + "/menus", null, null, loadMenusResponse, getToken());
    }

    function loadMenusResponse(res){
        if(res.code != 200)
            alert(res.message);
        else
            setMenus(res.menus || []);
    }

    function loadRoleMappings(){
        callApi("GET", apibaseurl + "/role-mappings", null, null, loadRoleMappingsResponse, getToken());
    }

    function loadRoleMappingsResponse(res){
        if(res.code != 200)
            alert(res.message);
        else
            setRoleMappings(res.mappings || []);
    }

    function loadTasks(){
        setIsProgress(true);
        callApi("GET", apibaseurl + "/tasks", null, null, loadTasksResponse, getToken());
    }

    function loadTasksResponse(res){
        setIsProgress(false);
        if(res.code != 200)
            alert(res.message);
        else
            setTasks(res.tasks);
    }

    function loadMyTasks(){
        setIsProgress(true);
        callApi("GET", apibaseurl + "/tasks/my", null, null, loadTasksResponse, getToken());
    }

    function addTask(){
        if(taskName.trim() === ""){
            alert("Enter task name");
            return;
        }
        setIsProgress(true);
        callApi("POST", apibaseurl + "/tasks", {task: taskName.trim(), description: taskDescription.trim()}, null, addTaskResponse, getToken());
    }

    function addTaskResponse(res){
        setIsProgress(false);
        alert(res.message || "Task added successfully");
        if(res.code === 200){
            setTaskName("");
            setTaskDescription("");
            setTaskAssignedto("");
            loadTasks();
        }
    }

    async function addProjectManagerTasks(){
        setIsProgress(true);
        try{
            const existingTasksRes = await apiRequest("GET", apibaseurl + "/tasks");
            const existingTaskNames = (existingTasksRes.tasks || []).map((task)=>normalizeName(task.task));
            let addedCount = 0;

            for(const taskItem of projectManagerTaskTemplates){
                if(existingTaskNames.includes(normalizeName(taskItem.task)))
                    continue;

                const taskRes = await apiRequest("POST", apibaseurl + "/tasks", taskItem);
                if(taskRes.code !== 200)
                    throw new Error(taskRes.message || `Unable to add ${taskItem.task}`);
                addedCount += 1;
            }

            loadTasks();
            alert(addedCount > 0 ? `${addedCount} ProjectManager tasks added to database.` : "ProjectManager tasks already exist in database.");
        }catch(err){
            alert(err.message || err);
        }finally{
            setIsProgress(false);
        }
    }

    function assignTask(){
        if(taskAssignedto === ""){
            alert("Select user");
            return;
        }
        if(selectedTaskId === ""){
            alert("Select task");
            return;
        }
        if(taskDate.trim() === "" || taskHours.trim() === "" || taskMinutes.trim() === ""){
            alert("Enter date, hours and minutes");
            return;
        }

        setIsProgress(true);
        callApi("PUT", apibaseurl + "/tasks/" + selectedTaskId, {
            assignedto: Number(taskAssignedto),
            taskdate: taskDate.trim(),
            taskhours: taskHours.trim(),
            taskminutes: taskMinutes.trim()
        }, null, assignTaskResponse, getToken());
    }

    function assignTaskResponse(res){
        setIsProgress(false);
        alert(res.message || "Task assigned successfully");
        if(res.code === 200){
            setTaskAssignedto("");
            setSelectedTaskId("");
            setTaskDate("");
            setTaskHours("");
            setTaskMinutes("");
            loadTasks();
        }
    }

    function deleteTask(taskId){
        if(window.confirm("Are you sure you want to delete this task?")){
            setIsProgress(true);
            callApi("DELETE", apibaseurl + "/tasks/" + taskId, null, null, deleteTaskResponse, getToken());
        }
    }

    function deleteTaskResponse(res){
        setIsProgress(false);
        alert(res.message || "Task deleted successfully");
        if(res.code === 200){
            loadTasks();
        }
    }

    function loadProjects(){
        setIsProgress(true);
        callApi("GET", apibaseurl + "/projects", null, null, loadProjectsResponse, getToken());
    }

    function loadProjectsResponse(res){
        setIsProgress(false);
        if(res.code != 200)
            alert(res.message);
        else
            setProjects(res.projects || []);
    }

    function addProject(){
        if(projectName.trim() === ""){
            alert("Enter project name");
            return;
        }
        setIsProgress(true);
        callApi("POST", apibaseurl + "/projects", {
            project: projectName.trim(),
            description: projectDescription.trim()
        }, null, addProjectResponse, getToken());
    }

    function addProjectResponse(res){
        setIsProgress(false);
        alert(res.message || "Project added successfully");
        if(res.code === 200){
            setProjectName("");
            setProjectDescription("");
            loadProjects();
        }
    }

    function mapProject(){
        if(selectedProjectId === ""){
            alert("Select project");
            return;
        }
        if(projectMappedto === ""){
            alert("Select user");
            return;
        }
        setIsProgress(true);
        callApi("PUT", apibaseurl + "/projects/" + selectedProjectId, {
            mappedto: Number(projectMappedto)
        }, null, mapProjectResponse, getToken());
    }

    function mapProjectResponse(res){
        setIsProgress(false);
        alert(res.message || "Project mapped successfully");
        if(res.code === 200){
            setSelectedProjectId("");
            setProjectMappedto("");
            loadProjects();
        }
    }

    function deleteProject(projectId){
        if(window.confirm("Are you sure you want to delete this project?")){
            setIsProgress(true);
            callApi("DELETE", apibaseurl + "/projects/" + projectId, null, null, deleteProjectResponse, getToken());
        }
    }

    function deleteProjectResponse(res){
        setIsProgress(false);
        alert(res.message || "Project deleted successfully");
        if(res.code === 200){
            loadProjects();
        }
    }

    function addRole(){
        if(roleName.trim() === ""){
            alert("Enter role name");
            return;
        }
        setIsProgress(true);
        callApi("POST", apibaseurl + "/roles", {rolename: roleName.trim()}, null, addRoleResponse, getToken());
    }

    function addRoleResponse(res){
        setIsProgress(false);
        alert(res.message || "Role added successfully");
        if(res.code === 200 || res.role){
            setRoleName("");
            loadRoles();
        }
    }

    function addMenu(){
        if(menuName.trim() === ""){
            alert("Enter menu name");
            return;
        }
        setIsProgress(true);
        callApi("POST", apibaseurl + "/menus", {menuname: menuName.trim()}, null, addMenuResponse, getToken());
    }

    function addMenuResponse(res){
        setIsProgress(false);
        alert(res.message || "Menu added successfully");
        if(res.code === 200 || res.mid){
            setMenuName("");
            loadMenus();
        }
    }

    function handleMenuSelection(mid){
        setSelectedMenus((prev)=> prev.includes(mid) ? prev.filter((m)=>m !== mid) : [...prev, mid]);
    }

    function handleRoleSelection(role){
        setSelectedRole(role);
        if(role === ""){
            setSelectedMenus([]);
            return;
        }
        const mappedMenus = roleMappings
            .filter((mapping)=> Number(mapping.role) === Number(role))
            .map((mapping)=> Number(mapping.mid));
        setSelectedMenus(mappedMenus);
    }

    function mapRoleMenus(){
        if(selectedRole === ""){
            alert("Select role");
            return;
        }
        if(selectedMenus.length === 0){
            alert("Select at least one menu");
            return;
        }
        setIsProgress(true);
        callApi("POST", apibaseurl + "/role-mappings", {role: Number(selectedRole), menuIds: selectedMenus}, null, mapRoleMenusResponse, getToken());
    }

    function mapRoleMenusResponse(res){
        setIsProgress(false);
        alert(res.message || "Role menu mapping saved successfully");
        if(res.code === 200 || Array.isArray(res)){
            setSelectedRole("");
            setSelectedMenus([]);
            loadRoleMappings();
        }
    }

    function normalizeName(value){
        return String(value || "").replace(/\s+/g, "").toLowerCase();
    }

    function shouldShowMenu(menuName){
        return normalizeName(menuName) !== "snake";
    }

    function getMenuRoute(menuName){
        const normalizedMenuName = normalizeName(menuName);
        if(normalizedMenuName === "projectmanager" || normalizedMenuName === "project" || normalizedMenuName === "pro")
            return "ProjectManager";
        return menuName;
    }

    async function setupProjectCoordinator(){
        const requiredMenuNames = ["Dashboard", "My Task", "Task Manager", "ProjectManager", "My Profile"];
        setIsProgress(true);
        try{
            let rolesRes = await apiRequest("GET", apibaseurl + "/roles");
            if(rolesRes.code !== 200)
                throw new Error(rolesRes.message || "Unable to load roles");

            let projectRole = (rolesRes.roles || []).find((role)=>normalizeName(role.rolename) === "projectcoordinator");
            if(!projectRole){
                const addRoleRes = await apiRequest("POST", apibaseurl + "/roles", {rolename: "ProjectCoordinator"});
                if(addRoleRes.code !== 200)
                    throw new Error(addRoleRes.message || "Unable to create ProjectCoordinator role");
                rolesRes = await apiRequest("GET", apibaseurl + "/roles");
                projectRole = (rolesRes.roles || []).find((role)=>normalizeName(role.rolename) === "projectcoordinator");
            }

            let menusRes = await apiRequest("GET", apibaseurl + "/menus");
            if(menusRes.code !== 200)
                throw new Error(menusRes.message || "Unable to load menus");

            for(const menuNameItem of requiredMenuNames){
                const exists = (menusRes.menus || []).some((menu)=>normalizeName(menu.menu) === normalizeName(menuNameItem));
                if(!exists){
                    const addMenuRes = await apiRequest("POST", apibaseurl + "/menus", {menuname: menuNameItem});
                    if(addMenuRes.code !== 200)
                        throw new Error(addMenuRes.message || `Unable to create ${menuNameItem} menu`);
                    menusRes = await apiRequest("GET", apibaseurl + "/menus");
                }
            }

            const menuIds = requiredMenuNames
                .map((menuNameItem)=>(menusRes.menus || []).find((menu)=>normalizeName(menu.menu) === normalizeName(menuNameItem)))
                .filter(Boolean)
                .map((menu)=>Number(menu.mid));

            if(!projectRole || menuIds.length !== requiredMenuNames.length)
                throw new Error("ProjectCoordinator setup could not find every required role/menu");

            const mappingRes = await apiRequest("POST", apibaseurl + "/role-mappings", {
                role: Number(projectRole.role),
                menuIds
            });
            if(mappingRes.code !== 200)
                throw new Error(mappingRes.message || "Unable to map menus to ProjectCoordinator");

            setSelectedRole(String(projectRole.role));
            setSelectedMenus(menuIds);
            await Promise.resolve();
            loadRoles();
            loadMenus();
            loadRoleMappings();
            alert("ProjectCoordinator role, ProjectManager menu, and required menu mappings are ready.");
        }catch(err){
            alert(err.message || err);
        }finally{
            setIsProgress(false);
        }
    }

    function getRoleName(roleId){
        const availableRoles = roles.length > 0 ? roles : defaultRoles;
        const foundRole = availableRoles.find((role)=> Number(role.role) === Number(roleId));
        return foundRole ? foundRole.rolename : roleId;
    }

    function getMenuName(menuId){
        const foundMenu = menus.find((menu)=> Number(menu.mid) === Number(menuId));
        return foundMenu ? foundMenu.menu : menuId;
    }

    function getStatusName(status){
        return Number(status) === 1 ? "Active" : "Inactive";
    }

    function getUserName(userId){
        const foundUser = users.find((user)=> Number(user.id) === Number(userId));
        return foundUser ? foundUser.fullname : (userId || "Unassigned");
    }

    function formatTaskDate(dateValue){
        if(!dateValue)
            return "-";
        const [year, month, day] = dateValue.split("-");
        return day && month && year ? `${day}-${month}-${year}` : dateValue;
    }

    function refreshRolePage(){
        setIsProgress(true);
        loadUsers();
        loadRoles();
        loadMenus();
        loadRoleMappings();
    }

    function renderContent(){
        switch(activeMenu){
            case "Dashboard":
                return (
                    <div className='dashboard-page'>
                        <div className='dashboard-hero'>
                            <div>
                                <p>Micro-Task Hub</p>
                                <h2>Workspace Overview</h2>
                                <span>Track tasks, assign users, and manage access in one control center.</span>
                            </div>
                            <div className='dashboard-stats'>
                                <div><strong>{tasks.length}</strong><span>Tasks</span></div>
                                <div><strong>{users.length}</strong><span>Users</span></div>
                                <div><strong>{roles.length}</strong><span>Roles</span></div>
                            </div>
                        </div>

                        <div className='animation-grid'>
                            <div className='motion-card task-motion'>
                                <div className='motion-header'>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <div className='kanban-motion'>
                                    <div className='motion-column'>
                                        <i></i>
                                        <b></b>
                                        <b></b>
                                    </div>
                                    <div className='motion-column'>
                                        <i></i>
                                        <b></b>
                                    </div>
                                    <div className='motion-column'>
                                        <i></i>
                                        <b></b>
                                    </div>
                                    <div className='floating-task'></div>
                                </div>
                                <h3>Task Flow</h3>
                                <p>Animated progress from created tasks to completed work.</p>
                            </div>

                            <div className='motion-card team-motion'>
                                <div className='team-orbit'>
                                    <span className='team-core'></span>
                                    <span className='person p1'></span>
                                    <span className='person p2'></span>
                                    <span className='person p3'></span>
                                    <span className='person p4'></span>
                                </div>
                                <h3>User Assignment</h3>
                                <p>Visualizes users receiving tasks and updates in real time.</p>
                            </div>

                            <div className='motion-card role-motion'>
                                <div className='shield-motion'>
                                    <span></span>
                                    <i></i>
                                    <b></b>
                                </div>
                                <div className='permission-bars'>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <h3>Role Permissions</h3>
                                <p>Highlights secure menu mapping for every role.</p>
                            </div>
                        </div>
                    </div>
                );
            case "My Task":
                return (
                    <div className='my-task-page'>
                        <section className='my-task-hero'>
                            <div>
                                <p>Assigned Work</p>
                                <h2>My Task</h2>
                                <span>Only tasks assigned to your user account are shown here.</span>
                            </div>
                            <div className='task-progress-orbit'>
                                <span></span>
                                <b>{tasks.length}</b>
                                <small>Tasks</small>
                            </div>
                        </section>

                        <div className='my-task-stats'>
                            <div>
                                <strong>{tasks.length}</strong>
                                <span>Total Tasks</span>
                            </div>
                            <div>
                                <strong>{tasks.filter((task)=>Number(task.status) === 1).length}</strong>
                                <span>Active</span>
                            </div>
                            <div>
                                <strong>{tasks.filter((task)=>Number(task.status) !== 1).length}</strong>
                                <span>Inactive</span>
                            </div>
                        </div>

                        <section className='my-task-board'>
                            {tasks.length > 0 ? tasks.map((task, index)=>(
                                <div key={task.id || index} className='my-task-card'>
                                    <div className='task-number'>{index + 1}</div>
                                    <div>
                                        <h3>{task.task}</h3>
                                        <p>{task.description || "No description added"}</p>
                                    </div>
                                    <span className='task-chip'>{getStatusName(task.status)}</span>
                                </div>
                            )) : (
                                <div className='empty-task-state'>
                                    <h3>No tasks found</h3>
                                    <p>No database tasks are currently assigned to this user.</p>
                                </div>
                            )}
                        </section>
                    </div>
                );
            case "Task Manager":
                return (
                    <div>
                        <h2>Task Manager</h2>
                        <div className='task-manager-container'>
                            <div className='task-form'>
                                <h3>Add New Task</h3>
                                <input type='text' placeholder='Task Name' value={taskName} onChange={(e)=>setTaskName(e.target.value)} />
                                <textarea placeholder='Description' value={taskDescription} onChange={(e)=>setTaskDescription(e.target.value)} ></textarea>
                                <button onClick={()=>addTask()}>Add Task</button>
                            </div>
                            <div className='tasks-list'>
                                <div className='task-assign-box'>
                                    <select value={taskAssignedto} onChange={(e)=>setTaskAssignedto(e.target.value)}>
                                        <option value=''>Select User</option>
                                        {users.map((user)=>(
                                            <option key={user.id} value={user.id}>{user.fullname}</option>
                                        ))}
                                    </select>
                                    <select value={selectedTaskId} onChange={(e)=>setSelectedTaskId(e.target.value)}>
                                        <option value=''>Select Task</option>
                                        {tasks.map((task)=>(
                                            <option key={task.id} value={task.id}>{task.task}</option>
                                        ))}
                                    </select>
                                    <input type='date' value={taskDate} onChange={(e)=>setTaskDate(e.target.value)} />
                                    <input type='number' min='0' max='23' placeholder='Hours' value={taskHours} onChange={(e)=>setTaskHours(e.target.value)} />
                                    <input type='number' min='0' max='59' placeholder='Minutes' value={taskMinutes} onChange={(e)=>setTaskMinutes(e.target.value)} />
                                    <button onClick={()=>assignTask()}>Add</button>
                                </div>
                                <div className='task-table-wrap'>
                                    <table className='task-table'>
                                        <thead>
                                            <tr>
                                                <th>S.No</th>
                                                <th>User</th>
                                                <th>Task</th>
                                                <th>Date</th>
                                                <th>Hours</th>
                                                <th>Minutes</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks && tasks.length > 0 ? tasks.map((task, index)=>(
                                                <tr key={task.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{getUserName(task.assignedto)}</td>
                                                    <td>
                                                        <strong>{task.task}</strong>
                                                        <span>{task.description}</span>
                                                    </td>
                                                    <td>{formatTaskDate(task.taskdate)}</td>
                                                    <td>{task.taskhours || "-"}</td>
                                                    <td>{task.taskminutes || "-"}</td>
                                                    <td><button className='delete-btn' onClick={()=>deleteTask(task.id)}>Delete</button></td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan='7' className='empty-row'>No tasks found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <h3>All Tasks</h3>
                                {tasks && tasks.map((task)=>(
                                    <div key={task.id} className='task-item'>
                                        <div className='task-info'>
                                            <p><strong>Task:</strong> {task.task}</p>
                                            <p><strong>Description:</strong> {task.description}</p>
                                            <p><strong>Assigned to:</strong> {getUserName(task.assignedto)}</p>
                                            <p><strong>Status:</strong> {task.status === 1 ? 'Active' : 'Inactive'}</p>
                                        </div>
                                        <button className='delete-btn' onClick={()=>deleteTask(task.id)}>Delete</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case "ProjectManager":
                return (
                    <div>
                        <h2>ProjectManager</h2>
                        <section className='project-task-panel'>
                            <div>
                                <p>Database Tasks</p>
                                <h3>Add Required ProjectManager Tasks</h3>
                                <span>These tasks will be stored in the backend tasks table and then appear in My Task.</span>
                            </div>
                            <button className='primary-btn' onClick={()=>addProjectManagerTasks()}>Add Tasks To Database</button>
                        </section>
                        <div className='task-manager-container'>
                            <div className='task-form'>
                                <h3>Add New Project</h3>
                                <input type='text' placeholder='Project Name' value={projectName} onChange={(e)=>setProjectName(e.target.value)} />
                                <textarea placeholder='Description' value={projectDescription} onChange={(e)=>setProjectDescription(e.target.value)} ></textarea>
                                <button onClick={()=>addProject()}>Add Project</button>
                            </div>
                            <div className='tasks-list'>
                                <div className='task-assign-box'>
                                    <select value={selectedProjectId} onChange={(e)=>setSelectedProjectId(e.target.value)}>
                                        <option value=''>Select Project</option>
                                        {projects.map((project)=>(
                                            <option key={project.id} value={project.id}>{project.project}</option>
                                        ))}
                                    </select>
                                    <select value={projectMappedto} onChange={(e)=>setProjectMappedto(e.target.value)}>
                                        <option value=''>Select User</option>
                                        {users.map((user)=>(
                                            <option key={user.id} value={user.id}>{user.fullname}</option>
                                        ))}
                                    </select>
                                    <button onClick={()=>mapProject()}>Map Project</button>
                                </div>
                                <div className='task-table-wrap'>
                                    <table className='task-table'>
                                        <thead>
                                            <tr>
                                                <th>S.No</th>
                                                <th>Project</th>
                                                <th>Description</th>
                                                <th>Mapped To</th>
                                                <th>Status</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects && projects.length > 0 ? projects.map((project, index)=>(
                                                <tr key={project.id}>
                                                    <td>{index + 1}</td>
                                                    <td>{project.project}</td>
                                                    <td>{project.description || "-"}</td>
                                                    <td>{getUserName(project.mappedto)}</td>
                                                    <td>{getStatusName(project.status)}</td>
                                                    <td><button className='delete-btn' onClick={()=>deleteProject(project.id)}>Delete</button></td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan='6' className='empty-row'>No projects found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "User Manager":
                return (
                    <div>
                        <h2>User Manager</h2>
                        <div className='users-list'>
                            {users.map((user)=>(
                                <div key={user.id} className='user-item'>
                                    <p><strong>Name:</strong> {user.fullname}</p>
                                    <p><strong>Email:</strong> {user.email}</p>
                                    <p><strong>Phone:</strong> {user.phone}</p>
                                    <p><strong>Role:</strong> {user.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "My Profile":
                return (
                    <div className='profile-page'>
                        <section className='profile-hero-card'>
                            <div className='profile-avatar'>V</div>
                            <div className='profile-main'>
                                <p>My Profile</p>
                                <h2>Vasudha</h2>
                                <span>Project Coordinator</span>
                            </div>
                            <div className='profile-status'>Active</div>
                        </section>

                        <div className='profile-details-grid'>
                            <div className='profile-detail-card'>
                                <span>Email</span>
                                <strong>vasudha@gmail.com</strong>
                            </div>
                            <div className='profile-detail-card'>
                                <span>Role</span>
                                <strong>ProjectCoordinator</strong>
                            </div>
                            <div className='profile-detail-card'>
                                <span>Workspace</span>
                                <strong>Micro-Task Hub</strong>
                            </div>
                            <div className='profile-detail-card'>
                                <span>Status</span>
                                <strong>Ready for tasks</strong>
                            </div>
                        </div>
                    </div>
                );
            case "Roles":
                return (
                    <div className='roles-page'>
                        <div className='section-kicker'>Roles</div>

                        <section className='roles-hero'>
                            <div>
                                <p>Access Control</p>
                                <h2>Roles</h2>
                            </div>
                            <div className='roles-summary'>
                                <div className='summary-card'>
                                    <strong>{roles.length}</strong>
                                    <span>Roles</span>
                                </div>
                                <div className='summary-card'>
                                    <strong>{menus.length}</strong>
                                    <span>Menus</span>
                                </div>
                            </div>
                        </section>

                        <div className='roles-actions'>
                            <section className='roles-panel'>
                                <div className='panel-title'>
                                    <span>R</span>
                                    <h3>Create Role</h3>
                                </div>
                                <div className='inline-form'>
                                    <input type='text' placeholder='Role name' value={roleName} onChange={(e)=>setRoleName(e.target.value)} />
                                    <button className='success-btn' onClick={()=>addRole()}>Add Role</button>
                                </div>
                            </section>

                            <section className='roles-panel'>
                                <div className='panel-title menu-title'>
                                    <span>M</span>
                                    <h3>Create Menu</h3>
                                </div>
                                <div className='inline-form'>
                                    <input type='text' placeholder='Menu name' value={menuName} onChange={(e)=>setMenuName(e.target.value)} />
                                    <button className='success-btn' onClick={()=>addMenu()}>Add Menu</button>
                                </div>
                            </section>
                        </div>

                        <section className='roles-panel permissions-panel'>
                            <div className='permissions-header'>
                                <div>
                                    <p>Permissions</p>
                                    <h3>Map Menus With Roles</h3>
                                </div>
                                <button className='primary-btn' onClick={()=>setupProjectCoordinator()}>Setup ProjectCoordinator</button>
                            </div>
                            <div className='permissions-grid'>
                                <select value={selectedRole} onChange={(e)=>handleRoleSelection(e.target.value)}>
                                    <option value=''>Select Role</option>
                                    {(roles.length > 0 ? roles : defaultRoles).map((role)=>(
                                        <option key={role.role} value={role.role}>{role.rolename}</option>
                                    ))}
                                </select>
                                <div className='menu-checklist'>
                                    {menus.filter((menu)=>shouldShowMenu(menu.menu)).map((menu)=>(
                                        <label key={menu.mid} className='menu-check'>
                                            <input type='checkbox' checked={selectedMenus.includes(menu.mid)} onChange={()=>handleMenuSelection(menu.mid)} />
                                            <img src={imgurl + (menu.icon || "dashboard.png")} alt='' onError={(e)=>{e.currentTarget.style.display = "none";}} />
                                            <span>{menu.menu}</span>
                                        </label>
                                    ))}
                                </div>
                                <button className='primary-btn' onClick={()=>mapRoleMenus()}>Add</button>
                            </div>
                            <div className='mapping-table-wrap'>
                                <table className='mapping-table'>
                                    <thead>
                                        <tr>
                                            <th>S.No</th>
                                            <th>Role</th>
                                            <th>Menu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roleMappings.length > 0 ? roleMappings.map((mapping, index)=>(
                                            <tr key={`${mapping.role}-${mapping.mid}`}>
                                                <td>{index + 1}</td>
                                                <td>{getRoleName(mapping.role)}</td>
                                                <td>{getMenuName(mapping.mid)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan='3' className='empty-row'>No role menu mappings found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className='roles-panel users-panel'>
                            <div className='users-panel-header'>
                                <div>
                                    <p>Admin</p>
                                    <h3>Users</h3>
                                </div>
                                <button className='primary-btn' onClick={()=>refreshRolePage()}>Refresh</button>
                            </div>
                            <div className='users-table-wrap'>
                                <table className='users-table'>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length > 0 ? users.map((user)=>(
                                            <tr key={user.id}>
                                                <td>{user.fullname}</td>
                                                <td>{user.email}</td>
                                                <td>{user.phone}</td>
                                                <td>{getRoleName(user.role)}</td>
                                                <td>{getStatusName(user.status)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan='5' className='empty-row'>No users found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                );
            default:
                return <div className='page-section'><h2>{activeMenu}</h2></div>;
        }
    }

    return (
        <div className='home'>
            <div className='home-header'>
                <img src="/logo.png" alt='' />
                <div className='info'>
                    {fullname}
                    <img src="/shutdown.png" alt='' onClick={()=>logout()} />
                </div>
                <button className='jwt-tool-link' type='button' onClick={()=>navigate('/jwt')}>JWT Tool</button>
            </div>
            <div className='home-workspace'>
                <div className='home-menus'>
                    <ul>
                        {displaySideMenus.filter((m)=>shouldShowMenu(m.displayName || m.menu)).map((m)=>(
                            <li key={m.mid || m.menu} className={activeMenu === m.menu ? 'active' : ''} onClick={()=>setActiveMenu(m.menu)}><img src={imgurl + m.icon} alt='' onError={(e)=>{e.currentTarget.style.display = "none";}} />{m.displayName || m.menu}</li>
                        ))}
                    </ul>
                    {Number(userRole) === 3 && (
                        <>
                            {!hasProjectManagerButton && (
                                <div className={activeMenu === "ProjectManager" ? 'role-menu-label active-role' : 'role-menu-label'} onClick={()=>setActiveMenu("ProjectManager")}>ProjectManager</div>
                            )}
                            <div className={activeMenu === "Roles" ? 'role-menu-label active-role' : 'role-menu-label'} onClick={()=>setActiveMenu("Roles")}>Roles</div>
                        </>
                    )}
                </div>
                <div className='home-content'>{renderContent()}</div>
            </div>
            <div className='home-footer'>Copyright @ 2026. All rights reserved.</div>

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default Home;
