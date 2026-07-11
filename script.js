// ============================================================
// CONFIGURATION
// ============================================================
const ADMIN_PASSWORD = 'kaleem7364';
const ADMIN_USER = 'admin';
const TOTAL_QUESTIONS = 34;

// Dimension mapping with colors
const DIMENSIONS = {
    expert: { label: 'الأنظمة الخبيرة', qids: [1,2,3,4], color: '#2E86AB' },
    ml: { label: 'تعلم الآلة', qids: [5,6,7,8], color: '#D4A373' },
    nn: { label: 'الشبكات العصبية', qids: [9,10,11,12], color: '#6A4C93' },
    genetic: { label: 'الخوارزميات الجينية', qids: [13,14,15,16], color: '#E07A5F' },
    relevance: { label: 'الملاءمة', qids: [17,18,19], color: '#3D8C7A' },
    faithful: { label: 'التمثيل الصادق', qids: [20,21,22], color: '#A23B72' },
    comparability: { label: 'المقارنة', qids: [23,24,25], color: '#F3A712' },
    verifiability: { label: 'القابلية للتحقق', qids: [26,27,28], color: '#4A7C59' },
    timeliness: { label: 'التوقيت المناسب', qids: [29,30,31], color: '#C44545' },
    understandability: { label: 'القابلية للفهم', qids: [32,33,34], color: '#3A86FF' }
};

// ============================================================
// STATE
// ============================================================
let responses = [];
let currentCharts = [];

// ============================================================
// DOM REFS
// ============================================================
const surveyView = document.getElementById('surveyView');
const loginView = document.getElementById('loginView');
const adminView = document.getElementById('adminView');

const submitBtn = document.getElementById('submitSurvey');
const goToAdminBtn = document.getElementById('goToAdminBtn');
const backToSurveyFromLogin = document.getElementById('backToSurveyFromLogin');
const backToSurveyFromAdmin = document.getElementById('backToSurveyFromAdmin');

const loginBtn = document.getElementById('loginBtn');
const adminUser = document.getElementById('adminUser');
const adminPass = document.getElementById('adminPass');
const logoutAdmin = document.getElementById('logoutAdmin');

const statsGrid = document.getElementById('statsGrid');
const tableBody = document.getElementById('tableBody');
const summaryContent = document.getElementById('summaryContent');
const chartContainer = document.getElementById('chartContainer');

const tableSearch = document.getElementById('tableSearch');
const filterGender = document.getElementById('filterGender');
const filterQual = document.getElementById('filterQual');
const applyFilters = document.getElementById('applyFilters');
const resetFilters = document.getElementById('resetFilters');

const exportExcel = document.getElementById('exportExcel');
const exportCSV = document.getElementById('exportCSV');
const exportPDF = document.getElementById('exportPDF');

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function getRadioValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : null;
}

function getPersonalData() {
    return {
        gender: getRadioValue('gender'),
        qualification: getRadioValue('qualification'),
        jobTitle: getRadioValue('jobTitle'),
        experience: getRadioValue('experience')
    };
}

function getAllAnswers() {
    const answers = {};
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const val = getRadioValue('q' + i);
        answers[i] = val ? parseInt(val) : null;
    }
    return answers;
}

function isSurveyComplete(personal, answers) {
    if (!personal.gender || !personal.qualification || !personal.jobTitle || !personal.experience) return false;
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        if (answers[i] === null || answers[i] === undefined) return false;
    }
    return true;
}

// ============================================================
// STORAGE
// ============================================================
function loadResponses() {
    try {
        const stored = localStorage.getItem('surveyResponses');
        responses = stored ? JSON.parse(stored) : [];
    } catch (e) {
        responses = [];
    }
}

function saveResponses() {
    localStorage.setItem('surveyResponses', JSON.stringify(responses));
}

// ============================================================
// SUBMIT SURVEY
// ============================================================
function submitSurvey() {
    const personal = getPersonalData();
    const answers = getAllAnswers();

    if (!isSurveyComplete(personal, answers)) {
        alert('⚠️ الرجاء الإجابة على جميع الأسئلة (بما في ذلك البيانات الشخصية) قبل الإرسال.');
        return;
    }

    const record = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        gender: personal.gender,
        qualification: personal.qualification,
        jobTitle: personal.jobTitle,
        experience: personal.experience,
        answers: answers
    };

    responses.push(record);
    saveResponses();

    // Reset form
    document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
    
    alert('✅ تم إرسال الاستبيان بنجاح. شكراً لك!');
}

// ============================================================
// NAVIGATION
// ============================================================
function showSurvey() {
    surveyView.classList.remove('hidden');
    loginView.classList.add('hidden');
    adminView.classList.add('hidden');
}

function showLogin() {
    surveyView.classList.add('hidden');
    loginView.classList.remove('hidden');
    adminView.classList.add('hidden');
    adminPass.value = '';
}

function showAdmin() {
    surveyView.classList.add('hidden');
    loginView.classList.add('hidden');
    adminView.classList.remove('hidden');
    renderAdmin();
}

// ============================================================
// RENDER ADMIN DASHBOARD
// ============================================================
function renderAdmin() {
    if (responses.length === 0) {
        statsGrid.innerHTML = `<div class="stat-card"><div class="stat-number">0</div><div class="stat-label">لا توجد استجابات</div></div>`;
        tableBody.innerHTML = `<tr><td colspan="7" style="padding:30px;">لا توجد بيانات لعرضها</td></tr>`;
        summaryContent.innerHTML = '<p style="text-align:center;color:#6a8aa0;padding:20px;">لا توجد بيانات كافية للإحصاء</p>';
        chartContainer.innerHTML = '<p style="text-align:center;color:#6a8aa0;padding:30px;">لا توجد بيانات كافية لعرض الرسوم البيانية</p>';
        return;
    }

    renderStats();
    renderTable();
    renderStatistics();
    renderCharts();
}

// ============================================================
// STATS
// ============================================================
function renderStats() {
    const total = responses.length;
    const completed = responses.filter(r => {
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            if (r.answers[i] === null || r.answers[i] === undefined) return false;
        }
        return true;
    }).length;

    const genderDist = { ذكر: 0, أنثى: 0 };
    const qualDist = { دبلوم: 0, بكالوريوس: 0, ماجستير: 0, دكتوراه: 0 };

    responses.forEach(r => {
        if (r.gender && genderDist.hasOwnProperty(r.gender)) genderDist[r.gender]++;
        if (r.qualification && qualDist.hasOwnProperty(r.qualification)) qualDist[r.qualification]++;
    });

    statsGrid.innerHTML = `
        <div class="stat-card accent-blue">
            <div class="stat-number">${total}</div>
            <div class="stat-label">إجمالي الاستجابات</div>
        </div>
        <div class="stat-card accent-green">
            <div class="stat-number">${completed}</div>
            <div class="stat-label">مكتملة</div>
        </div>
        <div class="stat-card accent-blue">
            <div class="stat-number">${genderDist.ذكر}</div>
            <div class="stat-label">ذكور</div>
        </div>
        <div class="stat-card accent-orange">
            <div class="stat-number">${genderDist.أنثى}</div>
            <div class="stat-label">إناث</div>
        </div>
        <div class="stat-card accent-blue">
            <div class="stat-number">${qualDist.بكالوريوس}</div>
            <div class="stat-label">بكالوريوس</div>
        </div>
        <div class="stat-card accent-green">
            <div class="stat-number">${qualDist.ماجستير}</div>
            <div class="stat-label">ماجستير</div>
        </div>
    `;
}

// ============================================================
// TABLE
// ============================================================
function renderTable() {
    const search = tableSearch.value.toLowerCase();
    const gFilter = filterGender.value;
    const qFilter = filterQual.value;

    let filtered = responses.filter(r => {
        if (gFilter && r.gender !== gFilter) return false;
        if (qFilter && r.qualification !== qFilter) return false;
        if (search) {
            const row = `${r.gender} ${r.qualification} ${r.jobTitle} ${r.experience}`.toLowerCase();
            if (!row.includes(search)) return false;
        }
        return true;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="padding:20px;">لا توجد نتائج مطابقة</td></tr>`;
        return;
    }

    let html = '';
    filtered.forEach((r, idx) => {
        let sum = 0, count = 0;
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            if (r.answers[i] !== null && r.answers[i] !== undefined) {
                sum += r.answers[i];
                count++;
            }
        }
        const avg = count > 0 ? (sum / count).toFixed(2) : '-';

        html += `
            <tr>
                <td>${idx + 1}</td>
                <td>${r.gender || '-'}</td>
                <td>${r.qualification || '-'}</td>
                <td>${r.jobTitle || '-'}</td>
                <td>${r.experience || '-'}</td>
                <td><strong>${avg}</strong></td>
                <td>
                    <button class="btn btn-outline" style="padding:4px 16px;font-size:0.8rem;min-width:auto;" 
                            onclick="alert('${JSON.stringify(r.answers).replace(/"/g,'&quot;')}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

// ============================================================
// STATISTICS (Professional Table)
// ============================================================
function renderStatistics() {
    // Per-question calculations
    const qMeans = {};
    const qStds = {};
    for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
        const vals = responses.map(r => r.answers[i]).filter(v => v !== null && v !== undefined);
        if (vals.length > 0) {
            const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
            const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
            qMeans[i] = mean;
            qStds[i] = Math.sqrt(variance);
        } else {
            qMeans[i] = 0;
            qStds[i] = 0;
        }
    }

    // Dimension calculations
    const dimData = {};
    for (const [dim, info] of Object.entries(DIMENSIONS)) {
        const qids = info.qids;
        const allVals = [];
        qids.forEach(qid => {
            responses.forEach(r => {
                const v = r.answers[qid];
                if (v !== null && v !== undefined) allVals.push(v);
            });
        });

        const mean = allVals.length > 0 ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0;
        const variance = allVals.length > 0 ? allVals.reduce((a, b) => a + (b - mean) ** 2, 0) / allVals.length : 0;
        const std = Math.sqrt(variance);

        // Cronbach's Alpha
        let alpha = 0;
        const dimSums = responses.map(r => {
            let s = 0, c = 0;
            qids.forEach(qid => {
                const v = r.answers[qid];
                if (v !== null && v !== undefined) { s += v; c++; }
            });
            return c > 0 ? s : null;
        }).filter(v => v !== null);

        if (dimSums.length > 1) {
            const k = qids.length;
            const totalMean = dimSums.reduce((a, b) => a + b, 0) / dimSums.length;
            const varTotal = dimSums.reduce((a, b) => a + (b - totalMean) ** 2, 0) / dimSums.length;
            const itemVars = qids.map(qid => {
                const vals = responses.map(r => r.answers[qid]).filter(v => v !== null && v !== undefined);
                if (vals.length < 2) return 0;
                const m = vals.reduce((a, b) => a + b, 0) / vals.length;
                return vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length;
            });
            const avgItemVar = itemVars.reduce((a, b) => a + b, 0) / itemVars.length;
            alpha = (k / (k - 1)) * (1 - (avgItemVar / varTotal));
            if (isNaN(alpha) || !isFinite(alpha)) alpha = 0;
        }

        dimData[dim] = {
            label: info.label,
            qids: qids,
            mean: mean,
            std: std,
            alpha: alpha,
            color: info.color
        };
    }

    // Overall Alpha
    const allSums = responses.map(r => {
        let s = 0, c = 0;
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            const v = r.answers[i];
            if (v !== null && v !== undefined) { s += v; c++; }
        }
        return c > 0 ? s : null;
    }).filter(v => v !== null);

    let overallAlpha = 0;
    if (allSums.length > 1) {
        const k = TOTAL_QUESTIONS;
        const totalMean = allSums.reduce((a, b) => a + b, 0) / allSums.length;
        const varTotal = allSums.reduce((a, b) => a + (b - totalMean) ** 2, 0) / allSums.length;
        const itemVars = [];
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            const vals = responses.map(r => r.answers[i]).filter(v => v !== null && v !== undefined);
            if (vals.length < 2) { itemVars.push(0); continue; }
            const m = vals.reduce((a, b) => a + b, 0) / vals.length;
            itemVars.push(vals.reduce((a, b) => a + (b - m) ** 2, 0) / vals.length);
        }
        const avgItemVar = itemVars.reduce((a, b) => a + b, 0) / itemVars.length;
        overallAlpha = (k / (k - 1)) * (1 - (avgItemVar / varTotal));
        if (isNaN(overallAlpha) || !isFinite(overallAlpha)) overallAlpha = 0;
    }

    // Sort dimensions by mean (descending)
    const sortedDims = Object.entries(dimData).sort((a, b) => b[1].mean - a[1].mean);

    // Build the summary table
    let html = `
        <table class="summary-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>البعد</th>
                    <th>المتوسط</th>
                    <th>الانحراف المعياري</th>
                    <th>ألفا كرونباخ</th>
                    <th>عدد الأسئلة</th>
                </tr>
            </thead>
            <tbody>
    `;

    sortedDims.forEach(([dim, data], index) => {
        const alphaClass = data.alpha >= 0.7 ? 'alpha-good' : (data.alpha >= 0.5 ? 'alpha-acceptable' : 'alpha-poor');
        html += `
            <tr>
                <td><span class="rank-number">${index + 1}</span></td>
                <td>
                    <div class="dimension-cell">
                        <span class="color-dot" style="background:${data.color};"></span>
                        ${data.label}
                    </div>
                </td>
                <td><strong>${data.mean.toFixed(2)}</strong></td>
                <td>${data.std.toFixed(3)}</td>
                <td><span class="alpha-value ${alphaClass}">${data.alpha.toFixed(4)}</span></td>
                <td>${data.qids.length}</td>
            </tr>
        `;
    });

    // Overall Alpha row
    const overallAlphaClass = overallAlpha >= 0.7 ? 'alpha-good' : (overallAlpha >= 0.5 ? 'alpha-acceptable' : 'alpha-poor');
    html += `
            <tr style="background: #eef4fa; font-weight: 700;">
                <td colspan="2" style="text-align: left; padding-right: 20px;">
                    <i class="fas fa-crown" style="color: #f3a712;"></i>
                    الإجمالي (جميع الأبعاد)
                </td>
                <td>${(Object.values(dimData).reduce((a, d) => a + d.mean, 0) / Object.keys(dimData).length).toFixed(2)}</td>
                <td>${(Object.values(dimData).reduce((a, d) => a + d.std, 0) / Object.keys(dimData).length).toFixed(3)}</td>
                <td><span class="alpha-value ${overallAlphaClass}">${overallAlpha.toFixed(4)}</span></td>
                <td>${TOTAL_QUESTIONS}</td>
            </tr>
    `;

    // Extra info row
    html += `
            <tr style="background: #f8faff;">
                <td colspan="6" style="text-align: right; padding: 10px 20px; font-size: 0.85rem; color: #4a6680;">
                    <i class="fas fa-info-circle" style="color: #1a5c9e;"></i>
                    عدد الاستجابات: <strong>${responses.length}</strong> &nbsp;|&nbsp;
                    عدد الأسئلة الكلي: <strong>${TOTAL_QUESTIONS}</strong> &nbsp;|&nbsp;
                    عدد الأبعاد: <strong>${Object.keys(DIMENSIONS).length}</strong>
                </td>
            </tr>
    `;

    html += `</tbody></table>`;

    summaryContent.innerHTML = html;
}

// ============================================================
// CHARTS
// ============================================================
function renderCharts() {
    // Destroy old charts
    currentCharts.forEach(c => c.destroy());
    currentCharts = [];
    chartContainer.innerHTML = '';

    // 1. Gender Distribution
    const genderCount = { ذكر: 0, أنثى: 0 };
    responses.forEach(r => { if (r.gender && genderCount.hasOwnProperty(r.gender)) genderCount[r.gender]++; });

    const div1 = document.createElement('div');
    div1.className = 'chart-box';
    div1.innerHTML = `<h4><i class="fas fa-venus-mars"></i> توزيع الجنس</h4><canvas id="chartGender"></canvas>`;
    chartContainer.appendChild(div1);

    const ctx1 = document.getElementById('chartGender').getContext('2d');
    const chart1 = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['ذكر', 'أنثى'],
            datasets: [{ data: [genderCount.ذكر, genderCount.أنثى], backgroundColor: ['#1a5c9e', '#e8858a'] }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { font: { family: 'Tajawal' } } } } }
    });
    currentCharts.push(chart1);

    // 2. Qualification
    const qualCount = { دبلوم: 0, بكالوريوس: 0, ماجستير: 0, دكتوراه: 0 };
    responses.forEach(r => { if (r.qualification && qualCount.hasOwnProperty(r.qualification)) qualCount[r.qualification]++; });

    const div2 = document.createElement('div');
    div2.className = 'chart-box';
    div2.innerHTML = `<h4><i class="fas fa-graduation-cap"></i> المؤهل العلمي</h4><canvas id="chartQual"></canvas>`;
    chartContainer.appendChild(div2);

    const ctx2 = document.getElementById('chartQual').getContext('2d');
    const chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'],
            datasets: [{ 
                data: [qualCount.دبلوم, qualCount.بكالوريوس, qualCount.ماجستير, qualCount.دكتوراه], 
                backgroundColor: ['#4a8bc2', '#1a5c9e', '#154a7e', '#0f3a63']
            }]
        },
        options: { plugins: { legend: { display: false } } }
    });
    currentCharts.push(chart2);

    // 3. Dimension Means (Radar)
    const dimLabels = Object.keys(DIMENSIONS).map(k => DIMENSIONS[k].label);
    const dimMeans = Object.keys(DIMENSIONS).map(k => {
        const qids = DIMENSIONS[k].qids;
        let sum = 0, count = 0;
        responses.forEach(r => {
            qids.forEach(qid => {
                const v = r.answers[qid];
                if (v !== null && v !== undefined) { sum += v; count++; }
            });
        });
        return count > 0 ? sum / count : 0;
    });

    const div3 = document.createElement('div');
    div3.className = 'chart-box';
    div3.innerHTML = `<h4><i class="fas fa-chart-line"></i> متوسطات الأبعاد</h4><canvas id="chartDim"></canvas>`;
    chartContainer.appendChild(div3);

    const ctx3 = document.getElementById('chartDim').getContext('2d');
    const chart3 = new Chart(ctx3, {
        type: 'radar',
        data: {
            labels: dimLabels,
            datasets: [{ 
                label: 'المتوسط', 
                data: dimMeans, 
                backgroundColor: 'rgba(26,92,158,0.2)', 
                borderColor: '#1a5c9e',
                pointBackgroundColor: '#1a5c9e'
            }]
        },
        options: {
            scales: { r: { min: 1, max: 5, ticks: { font: { family: 'Tajawal' } } } },
            plugins: { legend: { labels: { font: { family: 'Tajawal' } } } }
        }
    });
    currentCharts.push(chart3);

    // 4. Experience Distribution
    const expCount = { 'أقل من 5 سنوات': 0, '5-10 سنوات': 0, '11-15 سنة': 0, 'أكثر من 15 سنة': 0 };
    responses.forEach(r => { if (r.experience && expCount.hasOwnProperty(r.experience)) expCount[r.experience]++; });

    const div4 = document.createElement('div');
    div4.className = 'chart-box';
    div4.innerHTML = `<h4><i class="fas fa-clock"></i> سنوات الخبرة</h4><canvas id="chartExp"></canvas>`;
    chartContainer.appendChild(div4);

    const ctx4 = document.getElementById('chartExp').getContext('2d');
    const chart4 = new Chart(ctx4, {
        type: 'pie',
        data: {
            labels: ['أقل من 5', '5-10', '11-15', 'أكثر من 15'],
            datasets: [{ 
                data: [expCount['أقل من 5 سنوات'], expCount['5-10 سنوات'], expCount['11-15 سنة'], expCount['أكثر من 15 سنة']],
                backgroundColor: ['#1a5c9e', '#4a8bc2', '#8ab0d0', '#b8cfe0']
            }]
        },
        options: { plugins: { legend: { position: 'bottom', labels: { font: { family: 'Tajawal' } } } } }
    });
    currentCharts.push(chart4);
}

// ============================================================
// EXPORT
// ============================================================
function exportData(format) {
    if (responses.length === 0) {
        alert('لا توجد بيانات للتصدير.');
        return;
    }

    let rows = [];
    const header = ['id', 'gender', 'qualification', 'jobTitle', 'experience', ...Array.from({ length: TOTAL_QUESTIONS }, (_, i) => 'q' + (i + 1))];
    rows.push(header);

    responses.forEach(r => {
        const row = [r.id, r.gender, r.qualification, r.jobTitle, r.experience];
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
            row.push(r.answers[i] !== undefined && r.answers[i] !== null ? r.answers[i] : '');
        }
        rows.push(row);
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');

    if (format === 'csv') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, 'survey_data.csv');
    } else if (format === 'excel') {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        downloadBlob(blob, 'survey_data.xls');
    }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generatePDF() {
    if (responses.length === 0) {
        alert('لا توجد بيانات لتقرير PDF.');
        return;
    }
    window.print();
}

// ============================================================
// EVENT LISTENERS
// ============================================================
submitBtn.addEventListener('click', submitSurvey);
goToAdminBtn.addEventListener('click', showLogin);
backToSurveyFromLogin.addEventListener('click', showSurvey);
backToSurveyFromAdmin.addEventListener('click', showSurvey);

loginBtn.addEventListener('click', function() {
    const user = adminUser.value.trim();
    const pass = adminPass.value.trim();
    if (user === ADMIN_USER && pass === ADMIN_PASSWORD) {
        showAdmin();
    } else {
        alert('❌ اسم المستخدم أو كلمة المرور غير صحيحة.');
        adminPass.value = '';
        adminPass.focus();
    }
});

adminPass.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loginBtn.click();
});

logoutAdmin.addEventListener('click', showSurvey);

applyFilters.addEventListener('click', renderTable);
resetFilters.addEventListener('click', function() {
    tableSearch.value = '';
    filterGender.value = '';
    filterQual.value = '';
    renderTable();
});

tableSearch.addEventListener('input', renderTable);

exportExcel.addEventListener('click', function() { exportData('excel'); });
exportCSV.addEventListener('click', function() { exportData('csv'); });
exportPDF.addEventListener('click', generatePDF);

// ============================================================
// INIT
// ============================================================
loadResponses();
showSurvey();

window.renderTable = renderTable;

console.log('✅ الاستبيان جاهز للاستخدام');
console.log(`📊 عدد الاستجابات المحفوظة: ${responses.length}`);
console.log('🔑 كلمة مرور المشرف: kaleem7364 (مخفية)');
