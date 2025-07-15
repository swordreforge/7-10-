// 登录状态
let isLoggedIn = false;
const USERNAME = 'root';
const PASSWORD = 'root';

// 模拟学生数据
let students = [
    { id: '1001', name: '张三', gender: '男', age: 20, class: '计算机1班' },
    { id: '1002', name: '李四', gender: '女', age: 19, class: '计算机2班' },
    { id: '1003', name: '王五', gender: '男', age: 21, class: '计算机1班' },
    { id: '1004', name: '赵六', gender: '女', age: 20, class: '计算机3班' },
    { id: '1005', name: '钱七', gender: '男', age: 22, class: '计算机2班' },
    { id: '1006', name: '孙八', gender: '女', age: 19, class: '计算机1班' },
    { id: '1007', name: '周九', gender: '男', age: 20, class: '计算机3班' },
    { id: '1008', name: '吴十', gender: '女', age: 21, class: '计算机2班' }
];

// 分页相关变量
let currentPage = 1;
const rowsPerPage = 8;

// DOM元素
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const mainApp = document.getElementById('mainApp');
const logoutBtn = document.getElementById('logoutBtn');
const studentTableBody = document.getElementById('studentTableBody');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const addStudentBtn = document.getElementById('addStudentBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const modal = document.getElementById('addStudentModal');
const closeBtn = document.querySelector('.close');
const addStudentForm = document.getElementById('addStudentForm');

// 初始化页面
function init() {
    checkLogin();
    setupLoginListeners();
    
    if(isLoggedIn) {
        initApp();
    }
}

function initApp() {
    renderTable();
    setupEventListeners();
}

function checkLogin() {
    // 检查登录状态
    const savedLogin = localStorage.getItem('studentSystemLogin');
    if(savedLogin === 'true') {
        isLoggedIn = true;
        showMainApp();
    } else {
        showLoginModal();
    }
}

function showLoginModal() {
    loginModal.style.display = 'block';
    mainApp.classList.add('hidden');
}

function showMainApp() {
    loginModal.style.display = 'none';
    mainApp.classList.remove('hidden');
}

function setupLoginListeners() {
    // 登录表单提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if(username === USERNAME && password === PASSWORD) {
            isLoggedIn = true;
            localStorage.setItem('studentSystemLogin', 'true');
            loginError.textContent = '';
            showMainApp();
            initApp();
        } else {
            loginError.textContent = '用户名或密码错误';
        }
    });
    
    // 退出登录
    logoutBtn.addEventListener('click', function() {
        isLoggedIn = false;
        localStorage.removeItem('studentSystemLogin');
        showLoginModal();
        loginForm.reset();
    });
}

// 渲染学生表格
function renderTable(data = students) {
    if(!isLoggedIn) {
        showLoginModal();
        return;
    }
    
    studentTableBody.innerHTML = '';
    
    // 分页逻辑
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    
    if(paginatedData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align:center;">暂无数据</td>';
        studentTableBody.appendChild(row);
        return;
    }
    
    // 渲染表格行
    paginatedData.forEach(student => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.gender}</td>
            <td>${student.age}</td>
            <td>${student.class}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${student.id}">编辑</button>
                <button class="action-btn delete-btn" data-id="${student.id}">删除</button>
            </td>
        `;
        
        studentTableBody.appendChild(row);
    });
    
    // 更新分页信息
    updatePagination(data.length);
    
    // 添加编辑和删除按钮事件
    addEditDeleteEventListeners();
}

// 更新分页信息
function updatePagination(totalItems) {
    if(!isLoggedIn) return;
    
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    
    pageInfo.textContent = `第${currentPage}页/共${totalPages}页`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// 搜索功能
function searchStudents() {
    if(!isLoggedIn) {
        showLoginModal();
        return;
    }
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        currentPage = 1;
        renderTable(students);
        return;
    }
    
    const filteredStudents = students.filter(student => 
        student.id.toLowerCase().includes(searchTerm) || 
        student.name.toLowerCase().includes(searchTerm)
    );
    
    currentPage = 1;
    renderTable(filteredStudents);
}

// 添加事件监听器
function setupEventListeners() {
    if(!isLoggedIn) return;
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', searchStudents);
    
    // 搜索输入框回车事件
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchStudents();
        }
    });
    
    // 分页按钮事件
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(students.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    
    // 添加学生按钮事件
    addStudentBtn.addEventListener('click', () => {
        if(!isLoggedIn) {
            showLoginModal();
            return;
        }
        
        addStudentForm.reset();
        delete addStudentForm.dataset.editing;
        modal.style.display = 'block';
    });
    
    // 关闭模态框事件
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 添加编辑和删除按钮事件
function addEditDeleteEventListeners() {
    if(!isLoggedIn) return;
    
    // 编辑按钮
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const studentId = e.target.getAttribute('data-id');
            const student = students.find(s => s.id === studentId);
            
            if (student) {
                // 填充表单
                document.getElementById('studentId').value = student.id;
                document.getElementById('studentName').value = student.name;
                document.getElementById('studentGender').value = student.gender;
                document.getElementById('studentAge').value = student.age;
                document.getElementById('studentClass').value = student.class;
                
                // 显示模态框
                modal.style.display = 'block';
                
                // 临时存储编辑状态
                addStudentForm.dataset.editing = studentId;
            }
        });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const studentId = e.target.getAttribute('data-id');
            
            if (confirm(`确定要删除学号为 ${studentId} 的学生吗?`)) {
                students = students.filter(student => student.id !== studentId);
                renderTable();
            }
        });
    });
}

// 表单提交处理
addStudentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if(!isLoggedIn) {
        showLoginModal();
        return;
    }
    
    const studentId = document.getElementById('studentId').value;
    const studentName = document.getElementById('studentName').value;
    const studentGender = document.getElementById('studentGender').value;
    const studentAge = parseInt(document.getElementById('studentAge').value);
    const studentClass = document.getElementById('studentClass').value;
    
    const studentData = {
        id: studentId,
        name: studentName,
        gender: studentGender,
        age: studentAge,
        class: studentClass
    };
    
    if (addStudentForm.dataset.editing) {
        // 编辑现有学生
        const index = students.findIndex(s => s.id === addStudentForm.dataset.editing);
        if (index !== -1) {
            students[index] = studentData;
        }
        delete addStudentForm.dataset.editing;
    } else {
        // 添加新学生
        // 检查学号是否已存在
        if(students.some(s => s.id === studentId)) {
            alert('该学号已存在！');
            return;
        }
        students.push(studentData);
    }
    
    renderTable();
    modal.style.display = 'none';
});

// 初始化应用
init();