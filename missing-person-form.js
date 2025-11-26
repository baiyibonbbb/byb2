// 全局变量存储表单数据和图片
let formData = {};
let uploadedImage = null;
const STORAGE_KEY = 'missingPersonFormData'; // 本地存储键名

// DOM 元素
const form = document.getElementById('missingPersonForm');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');
const generateNoticeBtn = document.getElementById('generateNotice');
const noticePreviewSection = document.getElementById('noticePreview');
const formSection = document.querySelector('.form-section');
const printNoticeBtn = document.getElementById('printNotice');
const downloadPDFBtn = document.getElementById('downloadPDF');
const editNoticeBtn = document.getElementById('editNotice');
const contactPhoneInput = document.getElementById('contactPhone');
const ageInput = document.getElementById('age');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const missingDateInput = document.getElementById('missingDate');
const contactNameInput = document.getElementById('contactName');
const nameInput = document.getElementById('name');
const missingLocationInput = document.getElementById('missingLocation');
const rewardInput = document.getElementById('reward');

// 初始化函数
function init() {
    // 绑定事件监听器
    bindEventListeners();
    // 设置默认日期为今天
    document.getElementById('missingDate').valueAsDate = new Date();
}

// 绑定事件监听器
function bindEventListeners() {
    // 表单验证
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    });
    
    // 图片上传处理
    imageUpload.addEventListener('change', handleImageUpload);
    removeImage.addEventListener('click', handleRemoveImage);
    
    // 添加拖放功能
    const uploadContainer = document.querySelector('.upload-container');
    if (uploadContainer) {
        uploadContainer.addEventListener('dragover', handleImageUpload);
        uploadContainer.addEventListener('drop', handleImageUpload);
        uploadContainer.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
        });
        uploadContainer.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.backgroundColor = 'transparent';
        });
    }
    
    // 生成寻人启事
    generateNoticeBtn.addEventListener('click', generateNotice);
    
    // 打印功能
    printNoticeBtn.addEventListener('click', printNotice);
    
    // 编辑信息
    editNoticeBtn.addEventListener('click', showForm);
    
    // 表单字段验证 - 添加实时验证
    contactPhoneInput.addEventListener('input', validatePhone);
    contactPhoneInput.addEventListener('blur', validatePhone);
    
    ageInput.addEventListener('input', validateNumberInput);
    ageInput.addEventListener('blur', validateAgeRange);
    
    heightInput.addEventListener('input', validateNumberInput);
    heightInput.addEventListener('blur', validateHeightRange);
    
    weightInput.addEventListener('input', validateNumberInput);
    weightInput.addEventListener('blur', validateWeightRange);
    
    nameInput.addEventListener('input', validateName);
    nameInput.addEventListener('blur', validateName);
    
    missingLocationInput.addEventListener('input', validateLocation);
    missingLocationInput.addEventListener('blur', validateLocation);
    
    contactNameInput.addEventListener('input', validateContactName);
    contactNameInput.addEventListener('blur', validateContactName);
    
    missingDateInput.addEventListener('change', validateMissingDate);
    
    rewardInput.addEventListener('input', validateReward);
    rewardInput.addEventListener('blur', validateReward);
    
    // 为所有必填字段添加input事件监听器，用于即时清除错误样式
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                removeErrorStyle(this);
            }
        });
    });
    
    // 绑定表单自动保存事件
    bindAutoSave();
    
    // 尝试从本地存储恢复表单数据
    setTimeout(() => {
        restoreFormData();
    }, 100);
}

// 验证电话号码
function validatePhone(e) {
    const phone = e.target.value;
    // 支持中国手机号和固定电话
    const phoneRegex = /^(1[3-9]\d{9})$|^((0\d{2,3}-?)?\d{7,8})$/;
    
    if (phone === '') {
        // 空值时不报错，但保持required属性的作用
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    if (!phoneRegex.test(phone)) {
        e.target.setCustomValidity('请输入有效的手机号码（11位数字）或固定电话');
        addErrorStyle(e.target, '请输入有效的手机号码（11位数字）或固定电话');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证姓名
function validateName(e) {
    const name = e.target.value.trim();
    
    if (name === '') {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    // 中文姓名或英文姓名，长度2-20
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/;
    if (!nameRegex.test(name)) {
        e.target.setCustomValidity('请输入有效的姓名（2-20个字符）');
        addErrorStyle(e.target, '请输入有效的姓名（2-20个字符）');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证年龄范围
function validateAgeRange(e) {
    const age = parseInt(e.target.value);
    
    if (isNaN(age) || e.target.value === '') {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    if (age < 0 || age > 120) {
        e.target.setCustomValidity('年龄应在0-120岁之间');
        addErrorStyle(e.target, '年龄应在0-120岁之间');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证身高范围
function validateHeightRange(e) {
    const height = parseInt(e.target.value);
    
    if (isNaN(height) || e.target.value === '') {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    if (height < 50 || height > 250) {
        e.target.setCustomValidity('身高应在50-250cm之间');
        addErrorStyle(e.target, '身高应在50-250cm之间');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证体重范围
function validateWeightRange(e) {
    const weight = parseInt(e.target.value);
    
    if (isNaN(weight) || e.target.value === '') {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    if (weight < 1 || weight > 300) {
        e.target.setCustomValidity('体重应在1-300kg之间');
        addErrorStyle(e.target, '体重应在1-300kg之间');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证失踪日期
function validateMissingDate(e) {
    const missingDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 不允许选择未来日期
    if (missingDate > today) {
        e.target.setCustomValidity('失踪日期不能是未来日期');
        addErrorStyle(e.target, '失踪日期不能是未来日期');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证联系姓名
function validateContactName(e) {
    const name = e.target.value.trim();
    
    if (name === '') {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    const nameRegex = /^[\u4e00-\u9fa5a-zA-Z·]{2,20}$/;
    if (!nameRegex.test(name)) {
        e.target.setCustomValidity('请输入有效的联系人姓名（2-20个字符）');
        addErrorStyle(e.target, '请输入有效的联系人姓名（2-20个字符）');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证失踪地点
function validateLocation(e) {
    const location = e.target.value.trim();
    
    if (location === '') {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    if (location.length < 4 || location.length > 100) {
        e.target.setCustomValidity('请输入详细的失踪地点（4-100个字符）');
        addErrorStyle(e.target, '请输入详细的失踪地点（4-100个字符）');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证悬赏金额
function validateReward(e) {
    const reward = e.target.value.trim();
    
    if (reward === '') {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
        return;
    }
    
    // 支持中文数字和阿拉伯数字格式
    const rewardRegex = /^[\d零一二三四五六七八九十百千万亿]+(元|人民币)?$/;
    if (!rewardRegex.test(reward)) {
        e.target.setCustomValidity('请输入有效的悬赏金额');
        addErrorStyle(e.target, '请输入有效的悬赏金额，例如：1000元、壹仟元');
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 验证数字输入
function validateNumberInput(e) {
    const value = e.target.value;
    if (value !== '' && (isNaN(value) || parseInt(value) < 0)) {
        e.target.setCustomValidity('请输入有效的数字');
        addErrorStyle(e.target);
    } else {
        e.target.setCustomValidity('');
        removeErrorStyle(e.target);
    }
}

// 添加错误样式
function addErrorStyle(element, customMessage = null) {
    element.classList.add('error');
    const formGroup = element.closest('.form-group');
    if (formGroup) {
        // 移除已存在的错误信息
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            formGroup.removeChild(existingError);
        }
        
        // 添加新的错误信息
        const errorMessage = document.createElement('small');
        errorMessage.className = 'error-message';
        errorMessage.textContent = customMessage || element.validationMessage || '请检查输入';
        errorMessage.style.color = '#e74c3c';
        errorMessage.style.fontWeight = '500';
        formGroup.appendChild(errorMessage);
        
        // 添加抖动动画效果
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = 'none';
        }, 500);
    }
}

// 移除错误样式
function removeErrorStyle(element) {
    element.classList.remove('error');
    const formGroup = element.closest('.form-group');
    const errorMessage = formGroup ? formGroup.querySelector('.error-message') : null;
    if (errorMessage) {
        formGroup.removeChild(errorMessage);
    }
}

// 验证整个表单
function validateForm() {
    let isValid = true;
    
    // 获取所有字段
    const allFields = form.querySelectorAll('input, select, textarea');
    
    // 首先清除所有错误样式
    allFields.forEach(field => {
        removeErrorStyle(field);
    });
    
    // 自动保存表单数据
    saveFormData();
    
    // 触发各个字段的验证函数
    validateName({ target: nameInput });
    validatePhone({ target: contactPhoneInput });
    validateContactName({ target: contactNameInput });
    validateMissingDate({ target: missingDateInput });
    validateLocation({ target: missingLocationInput });
    
    // 数字字段验证
    if (ageInput.value) validateAgeRange({ target: ageInput });
    if (heightInput.value) validateHeightRange({ target: heightInput });
    if (weightInput.value) validateWeightRange({ target: weightInput });
    if (rewardInput.value) validateReward({ target: rewardInput });
    
    // 检查必填字段
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        if (!field.checkValidity()) {
            isValid = false;
            addErrorStyle(field, field.validationMessage || '此字段为必填项');
            
            // 如果是首次发现的错误字段，滚动到该字段
            if (isValid === false) {
                field.scrollIntoView({ behavior: 'smooth', block: 'center' });
                field.focus();
            }
        }
    });
    
    // 检查是否有任何字段带有错误样式
    const fieldsWithErrors = form.querySelectorAll('.error');
    if (fieldsWithErrors.length > 0) {
        isValid = false;
        
        // 如果有错误，显示一个综合提示
        showNotification('请检查表单中的错误并修正', 'error');
    }
    
    return isValid;
}

// 收集表单数据
function collectFormData() {
    const formElements = form.elements;
    const data = {};
    
    for (let i = 0; i < formElements.length; i++) {
        const element = formElements[i];
        if (element.name && element.type !== 'file') {
            data[element.name] = element.value;
        }
    }
    
    // 添加图片信息
    data.image = uploadedImage;
    
    return data;
}

// 处理图片上传
function handleImageUpload(e) {
    // 获取文件，支持从input或拖放事件获取
    let file;
    if (e.type === 'drop' || e.type === 'dragover') {
        e.preventDefault();
        file = e.dataTransfer.files[0];
    } else {
        file = e.target.files[0];
    }
    
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        showNotification('请上传JPG或PNG格式的图片', 'error');
        imageUpload.value = '';
        return;
    }
    
    // 检查文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
        showNotification('图片大小不能超过5MB', 'error');
        imageUpload.value = '';
        return;
    }
    
    // 创建上传容器引用
    const uploadContainer = document.querySelector('.upload-container');
    const originalContent = uploadContainer.innerHTML;
    
    // 显示加载动画
    uploadContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>正在处理图片...</p>
        </div>
    `;
    
    // 显示图片预览
    const reader = new FileReader();
    reader.onload = function(event) {
        // 恢复上传容器内容
        uploadContainer.innerHTML = originalContent;
        
        // 更新隐藏的input值
        if (e.target !== imageUpload) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            imageUpload.files = dataTransfer.files;
        }
        
        previewImg.src = event.target.result;
        imagePreview.classList.remove('hidden');
        uploadedImage = event.target.result;
        
        // 添加图片加载完成动画
        previewImg.style.opacity = '0';
        setTimeout(() => {
            previewImg.style.transition = 'opacity 0.3s ease';
            previewImg.style.opacity = '1';
        }, 50);
        
        showNotification('图片上传成功', 'success');
        
        // 保存图片数据到本地存储
        saveFormData();
    };
    
    reader.onerror = function() {
        // 恢复上传容器内容
        uploadContainer.innerHTML = originalContent;
        showNotification('图片上传失败，请重试', 'error');
    };
    
    reader.readAsDataURL(file);
}

// 处理移除图片
function handleRemoveImage() {
    // 添加淡出动画
    previewImg.style.opacity = '0';
    
    setTimeout(() => {
        previewImg.src = '';
        imagePreview.classList.add('hidden');
        imageUpload.value = '';
        uploadedImage = null;
        previewImg.style.opacity = '1'; // 重置透明度为下一次使用
        previewImg.style.transition = 'none'; // 重置过渡效果
        
        // 更新本地存储
        saveFormData();
    }, 300);
    
    showNotification('图片已移除', 'info');
}

// 生成寻人启事
function generateNotice() {
    // 验证表单
    if (!validateForm()) {
        alert('请完善必填信息并修正错误');
        return;
    }
    
    // 收集数据
    formData = collectFormData();
    
    // 生成寻人启事内容
    generateNoticeContent();
    
    // 显示预览区域，隐藏表单
    formSection.classList.add('hidden');
    noticePreviewSection.classList.remove('hidden');
}

// 生成寻人启事内容
function generateNoticeContent() {
    const noticeContent = document.getElementById('noticeContent');
    const today = new Date().toLocaleDateString('zh-CN');
    
    // 计算失踪天数
    let missingDays = '';
    if (formData.missingDate) {
        const missingDate = new Date(formData.missingDate);
        const now = new Date();
        const diffTime = Math.abs(now - missingDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        missingDays = `<div class="missing-days" style="text-align: center; margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-radius: 5px;">已失踪 <span style="color: #e74c3c; font-weight: bold; font-size: 1.2em;">${diffDays}</span> 天</div>`;
    }
    
    let html = `
        <div class="notice-container">
            <div class="notice-header">
                <h1>寻人启事</h1>
                ${missingDays}
            </div>
            
            <div class="notice-body">
                <div class="person-info">
                    <div class="info-row">
                        <div class="info-item">
                            <span class="info-label">姓名：</span>
                            <span class="info-value">${formData.name || '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">年龄：</span>
                            <span class="info-value">${formData.age || '-'}岁</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">性别：</span>
                            <span class="info-value">${formData.gender || '-'}</span>
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-item">
                            <span class="info-label">身高：</span>
                            <span class="info-value">${formData.height ? formData.height + 'cm' : '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">体重：</span>
                            <span class="info-value">${formData.weight ? formData.weight + 'kg' : '-'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">体型：</span>
                            <span class="info-value">${formData.build || '-'}</span>
                        </div>
                    </div>
                    
                    ${formData.hair ? `
                    <div class="info-row">
                        <div class="info-item">
                            <span class="info-label">发型/发色：</span>
                            <span class="info-value">${formData.hair}</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${formData.clothes ? `
                    <div class="info-row">
                        <div class="info-item">
                            <span class="info-label">失踪时穿着：</span>
                            <span class="info-value">${formData.clothes}</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${formData.features ? `
                    <div class="info-row highlight-features">
                        <div class="info-item">
                            <span class="info-label">特殊特征：</span>
                            <span class="info-value" style="font-weight: 500;">${formData.features}</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="info-section">
                        <h4>失踪信息</h4>
                        <div class="info-row">
                            <div class="info-item">
                                <span class="info-label">失踪日期：</span>
                                <span class="info-value">${formData.missingDate || '-'}</span>
                            </div>
                            ${formData.missingTime ? `
                            <div class="info-item">
                                <span class="info-label">失踪时间：</span>
                                <span class="info-value">${formData.missingTime}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="info-row">
                            <div class="info-item">
                                <span class="info-label">失踪地点：</span>
                                <span class="info-value">${formData.missingLocation || '-'}</span>
                            </div>
                        </div>
                        
                        ${formData.circumstances ? `
                        <div class="info-row">
                            <div class="info-item full-width">
                                <span class="info-label">失踪情况：</span>
                                <span class="info-value">${formData.circumstances}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="contact-section">
                        <h3>联系方式</h3>
                        <div class="info-row">
                            <div class="info-item">
                                <span class="info-label">联系人：</span>
                                <span class="info-value">${formData.contactName || '-'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">联系电话：</span>
                                <span class="info-value" style="font-weight: 600; color: #e74c3c;">${formData.contactPhone || '-'}</span>
                            </div>
                        </div>
                        
                        ${formData.contactRelation ? `
                        <div class="info-row">
                            <div class="info-item">
                                <span class="info-label">与失踪人员关系：</span>
                                <span class="info-value">${formData.contactRelation}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${formData.reward ? `
                    <div class="reward-section">
                        <div class="info-row">
                            <div class="info-item">
                                <span class="info-label" style="color: #e74c3c; font-size: 1.1em;">悬赏金额：</span>
                                <span class="info-value" style="color: #e74c3c; font-weight: bold; font-size: 1.2em;">${formData.reward}</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="footer-info">
                        <div class="info-row">
                            <div class="info-item">
                                <span class="info-label">发布日期：</span>
                                <span class="info-value">${today}</span>
                            </div>
                        </div>
                        
                        <div class="emergency-numbers">
                            <p>紧急情况请立即拨打：110（报警电话）</p>
                        </div>
                    </div>
                </div>
                
                ${uploadedImage ? `
                <div class="image-container">
                    <img src="${uploadedImage}" alt="${formData.name || '失踪人员'}" class="person-image">
                    <p class="image-caption">${formData.name || '失踪人员'}照片</p>
                </div>
                ` : '<div class="no-image">照片：暂无</div>'}
            </div>
        </div>
    `;
    
    noticeContent.innerHTML = html;
    
    // 添加打印友好的CSS
    addPrintStyles();
}

// 打印寻人启事
function printNotice() {
    // 保存当前页面状态
    const originalTitle = document.title;
    const originalScrollY = window.scrollY;
    
    // 临时修改页面标题
    document.title = `寻人启事 - ${formData.name || '未知人员'}`;
    
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 等待滚动完成后打印
    setTimeout(() => {
        // 显示打印对话框
        window.print();
        
        // 恢复原始状态
        document.title = originalTitle;
        window.scrollTo({ top: originalScrollY, behavior: 'smooth' });
        
        showNotification('打印功能已启动', 'info');
    }, 500);
}

// 显示表单
function showForm() {
    formSection.classList.remove('hidden');
    noticePreviewSection.classList.add('hidden');
    
    // 滚动到表单顶部
    formSection.scrollIntoView({ behavior: 'smooth' });
}

// 导出PDF功能（模拟，实际应用中可能需要使用专门的PDF生成库）
function downloadPDF() {
    // 由于浏览器安全限制，纯前端难以直接生成PDF
    // 这里提供一个提示，告知用户需要打印并保存为PDF
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h4>导出PDF说明</h4>
            <p>由于浏览器安全限制，我们将通过打印功能帮助您导出PDF文件。</p>
            <p>请在打印对话框中选择"另存为PDF"选项。</p>
            <div class="notification-actions">
                <button id="confirmPrint" class="btn btn-sm btn-primary">开始打印</button>
                <button id="cancelPrint" class="btn btn-sm btn-secondary">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 显示通知动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 绑定按钮事件
    document.getElementById('confirmPrint').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            printNotice();
        }, 300);
    });
    
    document.getElementById('cancelPrint').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// 绑定下载PDF按钮
function bindPDFDownload() {
    if (downloadPDFBtn) {
        downloadPDFBtn.addEventListener('click', downloadPDF);
    }
}

// 添加分享功能
function addShareFunctionality() {
    // 检查浏览器是否支持分享API
    if (navigator.share) {
        // 创建分享按钮
        const previewActions = document.querySelector('.preview-actions');
        if (previewActions) {
            const shareBtn = document.createElement('button');
            shareBtn.type = 'button';
            shareBtn.className = 'btn btn-share';
            shareBtn.textContent = '分享';
            shareBtn.style.backgroundColor = '#27ae60';
            shareBtn.style.color = 'white';
            
            shareBtn.addEventListener('click', async () => {
                try {
                    await navigator.share({
                        title: `寻人启事 - ${formData.name || '未知人员'}`,
                        text: `寻找${formData.name || '未知人员'}，${formData.age || ''}岁，${formData.gender || ''}，${formData.missingLocation ? `于${formData.missingDate}在${formData.missingLocation}失踪` : ''}。如有线索请联系：${formData.contactPhone || ''}`,
                        url: window.location.href
                    });
                    showNotification('分享成功', 'success');
                } catch (err) {
                    // 用户取消分享不会报错，其他错误才会提示
                    if (err.name !== 'AbortError') {
                        showNotification('分享失败，请重试', 'error');
                    }
                }
            });
            
            previewActions.appendChild(shareBtn);
        }
    }
}

// 添加打印样式
function addPrintStyles() {
    // 检查是否已存在打印样式
    let printStyle = document.getElementById('print-styles');
    if (printStyle) {
        printStyle.remove();
    }
    
    printStyle = document.createElement('style');
    printStyle.id = 'print-styles';
    printStyle.textContent = `
        @media print {
            * {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
            }
            
            body {
                background: white;
                color: black;
                font-size: 12pt;
            }
            
            .container {
                max-width: 100%;
                padding: 0;
            }
            
            header, .form-section, .preview-actions, footer {
                display: none !important;
            }
            
            .notice-preview-section {
                box-shadow: none;
                padding: 0;
            }
            
            .notice-container {
                border: 1px solid #000;
                padding: 20pt;
                page-break-inside: avoid;
            }
            
            .notice-header h1 {
                font-size: 24pt;
                text-align: center;
                margin-bottom: 10pt;
                color: #e74c3c !important;
                page-break-after: avoid;
            }
            
            .notice-body {
                display: grid;
                grid-template-columns: 1fr 250px;
                gap: 15pt;
                margin-top: 15pt;
            }
            
            .person-info {
                font-size: 11pt;
                line-height: 1.6;
            }
            
            .info-row {
                margin-bottom: 8pt;
                display: flex;
                flex-wrap: wrap;
                gap: 10pt;
            }
            
            .info-item {
                flex: 1;
                min-width: 120px;
            }
            
            .info-item.full-width {
                min-width: 100%;
            }
            
            .info-label {
                font-weight: bold;
                color: #000 !important;
            }
            
            .highlight-features {
                background-color: #f8f9fa;
                padding: 8pt;
                border-radius: 4pt;
                border-left: 3px solid #e74c3c;
            }
            
            .contact-section {
                margin-top: 15pt;
                padding-top: 10pt;
                border-top: 1px solid #ddd;
            }
            
            .contact-section h3 {
                color: #e74c3c !important;
                font-size: 14pt;
                margin-bottom: 8pt;
            }
            
            .reward-section {
                margin-top: 10pt;
                padding: 10pt;
                background-color: #fff5f5;
                border-radius: 4pt;
                border: 1px dashed #e74c3c;
            }
            
            .person-image {
                max-width: 100%;
                height: auto;
                border: 1px solid #000;
                page-break-inside: avoid;
            }
            
            .image-caption {
                text-align: center;
                font-size: 10pt;
                margin-top: 5pt;
                color: #666;
            }
            
            .footer-info {
                margin-top: 15pt;
                padding-top: 10pt;
                border-top: 1px solid #ddd;
                font-size: 10pt;
            }
            
            .emergency-numbers {
                margin-top: 10pt;
                padding: 8pt;
                background-color: #f8f9fa;
                border-radius: 4pt;
                text-align: center;
            }
            
            /* 确保打印时图片质量 */
            img {
                max-resolution: 300dpi;
                image-resolution: from-image;
            }
            
            /* 防止内容被分割到不同页面 */
            .info-section, .contact-section, .reward-section, .footer-info {
                page-break-inside: avoid;
            }
        }
    `;
    
    document.head.appendChild(printStyle);
    
    // 添加自定义通知样式
    let notificationStyle = document.getElementById('custom-notification-style');
    if (!notificationStyle) {
        notificationStyle = document.createElement('style');
        notificationStyle.id = 'custom-notification-style';
        notificationStyle.textContent = `
            .custom-notification {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .custom-notification.show {
                opacity: 1;
                visibility: visible;
            }
            
            .notification-content {
                background-color: white;
                padding: 25px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                max-width: 400px;
                width: 90%;
                transform: translateY(-20px);
                transition: transform 0.3s ease;
            }
            
            .custom-notification.show .notification-content {
                transform: translateY(0);
            }
            
            .notification-content h4 {
                margin-top: 0;
                color: var(--primary-color);
                margin-bottom: 15px;
            }
            
            .notification-content p {
                margin-bottom: 10px;
                line-height: 1.5;
            }
            
            .notification-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .btn-sm {
                padding: 8px 16px;
                font-size: 0.9rem;
            }
            
            .btn-share:hover {
                background-color: #229954 !important;
            }
        `;
        document.head.appendChild(notificationStyle);
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', function() {
    init();
    bindPDFDownload();
    
    // 延迟添加分享功能，确保预览区域已创建
    setTimeout(() => {
        addShareFunctionality();
    }, 500);
    
    // 为表单重置按钮添加确认提示
    const resetBtn = document.querySelector('button[type="reset"]');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            if (!confirm('确定要重置所有表单数据吗？此操作不可撤销。')) {
                e.preventDefault();
            }
        });
    }
});

// 添加额外的CSS样式
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        /* 错误样式 */
        .error {
            border-color: #e74c3c !important;
        }
        .error:focus {
            box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2) !important;
        }
        .error-message {
            display: block;
            color: #e74c3c;
            font-size: 0.85rem;
            margin-top: 5px;
        }
        
        /* 加载动画 */
        .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: var(--primary-color);
        }
        .spinner {
            border: 3px solid rgba(231, 76, 60, 0.3);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            width: 30px;
            height: 30px;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* 错误抖动动画 */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        /* 通知样式 */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            color: white;
            font-weight: 500;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .notification.show {
            transform: translateX(0);
        }
        .notification.success {
            background-color: var(--success-color);
        }
        .notification.error {
            background-color: var(--primary-color);
        }
        .notification.info {
            background-color: var(--secondary-color);
        }
    `;
    document.head.appendChild(style);
});

// 显示通知函数
function showNotification(message, type = 'info') {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭通知
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 绑定表单自动保存事件
function bindAutoSave() {
    // 监听表单输入变化
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(saveFormData, 500));
        input.addEventListener('change', saveFormData);
    });
}

// 保存表单数据到本地存储
function saveFormData() {
    try {
        // 收集表单数据
        const formElements = form.elements;
        const data = {};
        
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            const name = element.name;
            
            if (name && element.type !== 'file') {
                data[name] = element.value;
            }
        }
        
        // 添加图片信息
        data.image = uploadedImage;
        
        // 保存到本地存储
        const saveData = {
            formData: data,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        
    } catch (error) {
        console.error('保存表单数据失败:', error);
    }
}

// 从本地存储恢复表单数据
function restoreFormData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            // 如果有保存的数据，显示恢复提示
            if (Object.keys(parsedData.formData).length > 0 || parsedData.formData.image) {
                const lastSaved = new Date(parsedData.timestamp).toLocaleString();
                
                if (confirm(`检测到上次保存的表单数据（保存时间：${lastSaved}），是否恢复？`)) {
                    // 恢复表单字段
                    const data = parsedData.formData;
                    const formElements = form.elements;
                    
                    for (let i = 0; i < formElements.length; i++) {
                        const element = formElements[i];
                        const name = element.name;
                        
                        if (name && element.type !== 'file' && data[name] !== undefined) {
                            element.value = data[name];
                        }
                    }
                    
                    // 恢复图片
                    if (data.image) {
                        uploadedImage = data.image;
                        previewImg.src = data.image;
                        imagePreview.classList.remove('hidden');
                    }
                    
                    showNotification('表单数据已恢复', 'success');
                }
            }
        }
    } catch (error) {
        console.error('恢复表单数据失败:', error);
    }
}

// 清除本地存储的表单数据
function clearFormStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        showNotification('已清除本地存储的表单数据', 'success');
    } catch (error) {
        console.error('清除表单数据失败:', error);
        showNotification('清除表单数据失败', 'error');
    }
}