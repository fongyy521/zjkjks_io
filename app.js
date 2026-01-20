class StudyTracker {
    constructor() {
        this.data = this.loadData();
        this.timerInterval = null;
        this.startTime = null;
        this.countdownInterval = null;
        this.examDate = new Date('2026-09-05T08:30:00');
        this.init();
    }

    loadData() {
        const saved = localStorage.getItem('studyTrackerData');
        return saved ? JSON.parse(saved) : {
            records: [],
            totalDays: 0,
            totalHours: 0,
            currentStreak: 0,
            subjectProgress: {
                shiwu: 0,
                caiguan: 0,
                jingjifa: 0
            }
        };
    }

    saveData() {
        localStorage.setItem('studyTrackerData', JSON.stringify(this.data));
    }

    init() {
        this.updateDisplay();
        this.setupEventListeners();
        this.renderCalendar();
        this.renderHistory();
        this.checkTodayStatus();
        this.updateCurrentDate();
        this.startCountdown();
    }

    startCountdown() {
        this.updateCountdown();
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        const now = new Date();
        const diff = this.examDate - now;

        if (diff <= 0) {
            document.getElementById('countdownDays').textContent = '0';
            document.getElementById('countdownHours').textContent = '0';
            document.getElementById('countdownMinutes').textContent = '0';
            document.getElementById('countdownSeconds').textContent = '0';
            clearInterval(this.countdownInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('countdownDays').textContent = days;
        document.getElementById('countdownHours').textContent = hours;
        document.getElementById('countdownMinutes').textContent = minutes;
        document.getElementById('countdownSeconds').textContent = seconds;
    }

    updateCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('zh-CN', options);
    }

    checkTodayStatus() {
        const today = new Date().toDateString();
        const todayRecord = this.data.records.find(r => r.date === today);
        const statusEl = document.getElementById('checkinStatus');
        const btn = document.getElementById('checkinBtn');

        if (todayRecord) {
            statusEl.textContent = '✅ 今日已打卡';
            statusEl.className = 'checkin-status checked';
            btn.textContent = '继续学习';
            btn.disabled = false;
        } else {
            statusEl.textContent = '⏰ 今日未打卡';
            statusEl.className = 'checkin-status unchecked';
            btn.textContent = '开始学习打卡';
            btn.disabled = false;
        }
    }

    startTimer() {
        this.startTime = new Date();
        document.getElementById('timerSection').style.display = 'block';
        document.getElementById('checkinBtn').style.display = 'none';
        
        this.timerInterval = setInterval(() => {
            const elapsed = new Date() - this.startTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            document.getElementById('timerDisplay').textContent = 
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (!this.startTime) return;
        
        clearInterval(this.timerInterval);
        const elapsed = new Date() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        
        this.saveCheckin(minutes);
        
        document.getElementById('timerSection').style.display = 'none';
        document.getElementById('checkinBtn').style.display = 'block';
        this.startTime = null;
    }

    saveCheckin(minutes) {
        const today = new Date().toDateString();
        const existingRecord = this.data.records.find(r => r.date === today);
        
        if (existingRecord) {
            existingRecord.totalMinutes += minutes;
            existingRecord.timestamp = new Date().toISOString();
        } else {
            this.data.records.push({
                date: today,
                totalMinutes: minutes,
                timestamp: new Date().toISOString(),
                subjects: {
                    shiwu: 0,
                    caiguan: 0,
                    jingjifa: 0
                }
            });
            this.data.totalDays++;
            this.calculateStreak();
        }
        
        this.data.totalHours += minutes / 60;
        this.saveData();
        this.updateDisplay();
        this.renderCalendar();
        this.renderHistory();
        this.checkTodayStatus();
        
        alert(`打卡成功！本次学习 ${minutes} 分钟`);
    }

    saveSubjectProgress() {
        const today = new Date().toDateString();
        const record = this.data.records.find(r => r.date === today);
        
        if (!record) {
            alert('请先进行打卡！');
            return;
        }
        
        const shiwuTime = parseInt(document.getElementById('time-shiwu').value) || 0;
        const caiguanTime = parseInt(document.getElementById('time-caiguan').value) || 0;
        const jingjifaTime = parseInt(document.getElementById('time-jingjifa').value) || 0;
        
        record.subjects.shiwu += shiwuTime;
        record.subjects.caiguan += caiguanTime;
        record.subjects.jingjifa += jingjifaTime;
        record.totalMinutes += shiwuTime + caiguanTime + jingjifaTime;
        
        this.data.totalHours += (shiwuTime + caiguanTime + jingjifaTime) / 60;
        
        this.data.subjectProgress.shiwu = Math.min(100, this.data.subjectProgress.shiwu + shiwuTime / 10);
        this.data.subjectProgress.caiguan = Math.min(100, this.data.subjectProgress.caiguan + caiguanTime / 10);
        this.data.subjectProgress.jingjifa = Math.min(100, this.data.subjectProgress.jingjifa + jingjifaTime / 10);
        
        this.saveData();
        this.updateDisplay();
        this.renderHistory();
        
        document.getElementById('time-shiwu').value = '';
        document.getElementById('time-caiguan').value = '';
        document.getElementById('time-jingjifa').value = '';
        
        alert('学习记录保存成功！');
    }

    calculateStreak() {
        const sortedRecords = [...this.data.records].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        let streak = 0;
        let currentDate = new Date();
        
        for (const record of sortedRecords) {
            const recordDate = new Date(record.date);
            const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
                streak++;
                currentDate = recordDate;
            } else {
                break;
            }
        }
        
        this.data.currentStreak = streak;
    }

    updateDisplay() {
        document.getElementById('totalDays').textContent = this.data.totalDays;
        document.getElementById('totalHours').textContent = this.data.totalHours.toFixed(1);
        document.getElementById('currentStreak').textContent = this.data.currentStreak;
        
        document.getElementById('progress-shiwu').style.width = `${this.data.subjectProgress.shiwu}%`;
        document.getElementById('progress-shiwu-text').textContent = `${this.data.subjectProgress.shiwu.toFixed(0)}%`;
        
        document.getElementById('progress-caiguan').style.width = `${this.data.subjectProgress.caiguan}%`;
        document.getElementById('progress-caiguan-text').textContent = `${this.data.subjectProgress.caiguan.toFixed(0)}%`;
        
        document.getElementById('progress-jingjifa').style.width = `${this.data.subjectProgress.jingjifa}%`;
        document.getElementById('progress-jingjifa-text').textContent = `${this.data.subjectProgress.jingjifa.toFixed(0)}%`;
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                          '七月', '八月', '九月', '十月', '十一月', '十二月'];
        
        let html = `<div class="calendar-header">${year}年 ${monthNames[month]}</div>`;
        html += '<div class="calendar-days">';
        ['日', '一', '二', '三', '四', '五', '六'].forEach(day => {
            html += `<div class="day-name">${day}</div>`;
        });
        html += '</div>';
        
        html += '<div class="calendar-dates">';
        
        for (let i = 0; i < startDay; i++) {
            html += '<div class="day empty"></div>';
        }
        
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = new Date(year, month, day).toDateString();
            const hasRecord = this.data.records.find(r => r.date === dateStr);
            const isToday = day === now.getDate();
            
            let className = 'day';
            if (hasRecord) className += ' checked';
            if (isToday) className += ' today';
            
            html += `<div class="${className}">${day}</div>`;
        }
        
        html += '</div>';
        calendar.innerHTML = html;
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        const sortedRecords = [...this.data.records].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 10);
        
        if (sortedRecords.length === 0) {
            historyList.innerHTML = '<div class="no-records">暂无学习记录</div>';
            return;
        }
        
        let html = '';
        sortedRecords.forEach(record => {
            const date = new Date(record.date);
            const hours = Math.floor(record.totalMinutes / 60);
            const minutes = record.totalMinutes % 60;
            
            html += `
                <div class="history-item">
                    <div class="history-date">${date.toLocaleDateString('zh-CN')}</div>
                    <div class="history-time">
                        实务: ${record.subjects.shiwu}分钟 | 
                        财管: ${record.subjects.caiguan}分钟 | 
                        经济法: ${record.subjects.jingjifa}分钟
                    </div>
                    <div class="history-total">总计: ${hours}小时${minutes}分钟</div>
                </div>
            `;
        });
        
        historyList.innerHTML = html;
    }

    clearAllData() {
        if (confirm('确定要清空所有学习记录吗？此操作不可恢复！')) {
            localStorage.removeItem('studyTrackerData');
            this.data = {
                records: [],
                totalDays: 0,
                totalHours: 0,
                currentStreak: 0,
                subjectProgress: {
                    shiwu: 0,
                    caiguan: 0,
                    jingjifa: 0
                }
            };
            this.saveData();
            this.updateDisplay();
            this.renderCalendar();
            this.renderHistory();
            this.checkTodayStatus();
            alert('所有记录已清空！');
        }
    }

    setupEventListeners() {
        document.getElementById('checkinBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopTimer());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveSubjectProgress());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAllData());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StudyTracker();
});