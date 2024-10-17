// 定义后端的基础 URL
const BASE_URL = 'http://127.0.0.1:5000';

document.addEventListener('DOMContentLoaded', function() {
    // 检查当前页面并加载相应的内容
    if (window.location.pathname.includes('blacklist.html')) {
        loadBlacklist();  // 如果是黑名单页面，加载黑名单联系人
    } else {
        loadContacts();  // 如果是主页面，加载所有联系人
    }

    // 处理添加联系人表单提交（仅在主页面存在时执行）
    const addContactForm = document.getElementById('add-contact-form');
    if (addContactForm) {
        addContactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            addContact();
        });
    }
});

// 编辑联系人表单的显示与提交
function editContact(id) {
    let keepEditing = true; // 控制是否继续编辑

    const updateFields = {}; // 用来存储用户要更新的字段和值

    while (keepEditing) {
        // 让用户选择要更新的字段
        const field = prompt("请选择需要更新的信息: 1) 姓名 2) 电话 3) 学号  (如果想要退出请点击取消)");

        if (!field) return; // 如果用户取消或未输入，直接返回

        let newValue;
        switch (field) {
            case '1':
                newValue = prompt("输入新的姓名:");
                if (newValue) {
                    updateFields.name = newValue; // 将新的值存储到 updateFields 对象中
                }
                break;
            case '2':
                newValue = prompt("输入新的电话:");
                if (newValue) {
                    updateFields.phone = newValue; // 将新的值存储到 updateFields 对象中
                }
                break;
            case '3':
                newValue = prompt("输入新的学号:");
                if (newValue) {
                    updateFields.student_id = newValue; // 将新的值存储到 updateFields 对象中
                }
                break;
            default:
                alert("无效的选择，请选择 1、2 或 3");
                continue; // 跳过当前循环
        }

        // 询问用户是否继续更改其他信息
        keepEditing = confirm("是否继续更改其他信息？");
    }

    // 如果有更新的字段，则发送请求
    if (Object.keys(updateFields).length > 0) {
        updateContactField(id, updateFields);
    }
}

// 更新联系人特定字段的函数
function updateContactField(id, updatedData) {
    fetch(`${BASE_URL}/update_contact/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (response.ok) {
            loadContacts(); // 成功后重新获取联系人列表
        } else {
            console.error('Failed to update contact');
        }
    })
    .catch(error => console.error('Error updating contact:', error));
}


// 加载黑名单联系人
function loadBlacklist() {
    fetch(`${BASE_URL}/blacklist_contacts`)
        .then(response => response.json())
        .then(data => {
            const blacklistList = document.getElementById('blacklist-list');
            blacklistList.innerHTML = ''; // 清空列表，避免重复渲染
            data.forEach(contact => {
                const row = document.createElement('tr');
                row.className = 'contact';
                row.id = `contact-${contact.id}`;
                row.innerHTML = `
                    <td>${contact.name}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.student_id}</td>
                    <td>
                        <button onclick="toggleBlacklist(${contact.id})">移出黑名单</button>
                    </td>
                `;
                blacklistList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching blacklist contacts:', error));
}

// 加载所有联系人并更新表格
function loadContacts() {
    fetch(`${BASE_URL}/contacts`)
        .then(response => response.json())
        .then(data => {
            const contactList = document.getElementById('contact-list');
            contactList.innerHTML = '';
            data.forEach(contact => {
                const row = document.createElement('tr');
                row.className = 'contact';
                row.innerHTML = `
                    <td class="${contact.special_care ? 'special-care' : ''}">${contact.name}</td>
                    <td>${contact.phone}</td>
                    <td>${contact.student_id}</td>
                    <td>${contact.special_care ? '是' : '否'}</td>
                    <td>${contact.blacklist ? '是' : '否'}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="deleteContact(${contact.id})">删除</button>
                            <button onclick="toggleSpecialCare(${contact.id})">${contact.special_care ? '取消特别关心' : '特别关心'}</button>
                            <button onclick="toggleBlacklist(${contact.id})">${contact.blacklist ? '移出黑名单' : '黑名单'}</button>
                            <button onclick="editContact(${contact.id})">编辑</button> <!-- 新增编辑按钮 -->
                        </div>
                    </td>
                `;
                contactList.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching contacts:', error));
}

// 添加联系人
function addContact() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const studentId = document.getElementById('student_id').value;

    fetch(`${BASE_URL}/add_contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, student_id: studentId })
    })
    .then(response => {
        if (response.ok) {
            loadContacts(); // 成功后重新获取联系人列表
            document.getElementById('add-contact-form').reset(); // 重置表单
        } else {
            console.error('Failed to add contact');
        }
    })
    .catch(error => console.error('Error adding contact:', error));
}

// 删除联系人
function deleteContact(id) {
    fetch(`${BASE_URL}/delete_contact/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadContacts(); // 成功后重新获取联系人列表
        } else {
            console.error('Failed to delete contact');
        }
    })
    .catch(error => console.error('Error deleting contact:', error));
}

// 切换特别关心状态
function toggleSpecialCare(id) {
    fetch(`${BASE_URL}/toggle_special_care/${id}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            loadContacts();  // 成功后重新获取联系人列表
        } else {
            console.error('Failed to toggle special care');
        }
    })
    .catch(error => console.error('Error toggling special care:', error));
}

// 切换黑名单状态
function toggleBlacklist(id) {
    fetch(`${BASE_URL}/toggle_blacklist/${id}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            // 如果当前页面是黑名单页面，重新加载黑名单
            if (window.location.pathname.includes('blacklist.html')) {
                loadBlacklist();
            } else {
                loadContacts();  // 如果是主页面，重新加载联系人列表
            }
        } else {
            console.error('Failed to toggle blacklist');
        }
    })
    .catch(error => console.error('Error toggling blacklist:', error));
}

// 导航到黑名单页面
function viewBlacklist() {
    window.location.href = 'blacklist.html';
}
