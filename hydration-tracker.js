document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const userSelect = document.getElementById('user-select');
    const newUserBtn = document.getElementById('new-user-btn');
    const deleteUserBtn = document.getElementById('delete-user-btn');
    const saveUserBtn = document.getElementById('save-user-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const addIntakeBtn = document.getElementById('add-intake-btn');
    const userForm = document.getElementById('user-form');
    const progressSection = document.getElementById('progress-section');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const currentIntake = document.getElementById('current-intake');
    const remainingIntake = document.getElementById('remaining-intake');
    const intakeList = document.getElementById('intake-list');
    const userAvatar = document.getElementById('user-avatar');
    const currentUserName = document.getElementById('current-user-name');
    const currentUserStats = document.getElementById('current-user-stats');
    const todayDate = document.getElementById('today-date');
    const quickAmountBtns = document.querySelectorAll('.quick-amount-btn');
    
    // Variables
    let users = {};
    let currentUserId = null;
    let hydrationChart = null;
    
    // Initialize the app
    init();
    
    // Event Listeners
    userSelect.addEventListener('change', loadUser);
    newUserBtn.addEventListener('click', showNewUserForm);
    deleteUserBtn.addEventListener('click', deleteCurrentUser);
    saveUserBtn.addEventListener('click', saveUserProfile);
    calculateBtn.addEventListener('click', calculateDailyGoal);
    addIntakeBtn.addEventListener('click', addWaterIntake);
    
    // Quick amount buttons
    quickAmountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = this.getAttribute('data-amount');
            document.getElementById('water-amount').value = amount;
            
            // Add animation
            this.classList.add('animate-bounce');
            setTimeout(() => {
                this.classList.remove('animate-bounce');
            }, 500);
        });
    });
    
    // Functions
    function init() {
        // Load saved data from localStorage
        const savedData = localStorage.getItem('hydrationTrackerData');
        
        if (savedData) {
            users = JSON.parse(savedData);
            populateUserSelect();
            updateTodayDate();
        }
    }
    
    function updateTodayDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date();
        todayDate.textContent = today.toLocaleDateString(undefined, options);
    }
    
    function populateUserSelect() {
        userSelect.innerHTML = '<option value="">Select a user...</option>';
        
        for (const userId in users) {
            const user = users[userId];
            const option = document.createElement('option');
            option.value = userId;
            option.textContent = user.name;
            userSelect.appendChild(option);
        }
    }
    
    function showNewUserForm() {
        // Reset form
        document.getElementById('user-name').value = '';
        document.getElementById('weight').value = '';
        document.getElementById('age').value = '';
        document.getElementById('activity').value = '1.55';
        
        // Hide progress section
        progressSection.style.display = 'none';
        
        // Show form with animation
        userForm.style.display = 'block';
        calculateBtn.style.display = 'none';
        saveUserBtn.style.display = 'block';
        
        // Set current user to null (new user)
        currentUserId = null;
    }
    
    function loadUser() {
        const userId = userSelect.value;
        
        if (!userId) {
            userForm.style.display = 'none';
            progressSection.style.display = 'none';
            currentUserId = null;
            return;
        }
        
        currentUserId = userId;
        const user = users[userId];
        
        // Update form with user data
        document.getElementById('user-name').value = user.name;
        document.getElementById('weight').value = user.weight || '';
        document.getElementById('age').value = user.age || '';
        document.getElementById('activity').value = user.activityLevel || '1.55';
        
        // Update avatar
        updateUserAvatar(user.name);
        
        // Show form and progress if they have a goal
        userForm.style.display = 'block';
        saveUserBtn.style.display = 'none';
        calculateBtn.style.display = user.dailyGoal ? 'none' : 'block';
        
        if (user.dailyGoal) {
            progressSection.style.display = 'block';
            currentUserName.textContent = user.name;
            currentUserStats.textContent = `Daily Goal: ${user.dailyGoal}ml`;
            updateProgress();
            renderIntakeHistory();
            initializeChart();
        } else {
            progressSection.style.display = 'none';
        }
    }
    
    function updateUserAvatar(name) {
        // Get initials for avatar
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        userAvatar.textContent = initials;
        
        // Generate a consistent color based on name
        const colors = ['#4361ee', '#4895ef', '#3f37c9', '#4cc9f0', '#560bad'];
        const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const colorIndex = hash % colors.length;
        userAvatar.style.backgroundColor = colors[colorIndex];
    }
    
    function saveUserProfile() {
        const name = document.getElementById('user-name').value.trim();
        const weight = parseFloat(document.getElementById('weight').value);
        const age = parseInt(document.getElementById('age').value);
        const activityLevel = document.getElementById('activity').value;
        
        if (!name) {
            alert('Please enter a name for the user');
            return;
        }
        
        // Create new user or update existing
        const userId = currentUserId || Date.now().toString();
        
        users[userId] = {
            name: name,
            weight: weight,
            age: age,
            activityLevel: activityLevel,
            dailyGoal: users[userId]?.dailyGoal || 0,
            todayIntake: users[userId]?.todayIntake || 0,
            intakeHistory: users[userId]?.intakeHistory || [],
            createdAt: users[userId]?.createdAt || new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('hydrationTrackerData', JSON.stringify(users));
        
        // Update UI
        populateUserSelect();
        userSelect.value = userId;
        currentUserId = userId;
        
        // Update avatar
        updateUserAvatar(name);
        
        // Hide form if they have a goal
        if (users[userId].dailyGoal) {
            userForm.style.display = 'none';
            progressSection.style.display = 'block';
            currentUserName.textContent = name;
            currentUserStats.textContent = `Daily Goal: ${users[userId].dailyGoal}ml`;
            updateProgress();
            renderIntakeHistory();
            initializeChart();
        } else {
            calculateBtn.style.display = 'block';
        }
        
        // Show success animation
        saveUserBtn.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            saveUserBtn.classList.remove('animate__animated', 'animate__pulse');
        }, 1000);
    }
    
    function deleteCurrentUser() {
        if (!currentUserId) {
            alert('Please select a user to delete');
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${users[currentUserId].name}'s profile? This cannot be undone.`)) {
            delete users[currentUserId];
            localStorage.setItem('hydrationTrackerData', JSON.stringify(users));
            
            // Reset UI
            userSelect.value = '';
            userForm.style.display = 'none';
            progressSection.style.display = 'none';
            populateUserSelect();
            currentUserId = null;
            
            // Show delete animation
            deleteUserBtn.classList.add('animate__animated', 'animate__shakeX');
            setTimeout(() => {
                deleteUserBtn.classList.remove('animate__animated', 'animate__shakeX');
            }, 1000);
        }
    }
    
    function calculateDailyGoal() {
        if (!currentUserId) return;
        
        const user = users[currentUserId];
        const weight = user.weight;
        const age = user.age;
        const activityLevel = parseFloat(user.activityLevel);
        
        // Basic validation
        if (!weight || !age) {
            alert('Please enter weight and age for this user');
            return;
        }
        
        // Calculate daily water requirement (ml)
        // Basic formula: 35ml per kg of body weight
        let baseRequirement = weight * 35;
        
        // Adjust for age (older people may need slightly less)
        if (age > 55) {
            baseRequirement *= 0.9;
        }
        
        // Adjust for activity level
        user.dailyGoal = Math.round(baseRequirement * activityLevel);
        
        // Save to localStorage
        localStorage.setItem('hydrationTrackerData', JSON.stringify(users));
        
        // Hide form and show progress
        userForm.style.display = 'none';
        progressSection.style.display = 'block';
        currentUserName.textContent = user.name;
        currentUserStats.textContent = `Daily Goal: ${user.dailyGoal}ml`;
        
        // Initialize chart
        initializeChart();
        
        // Update UI
        updateProgress();
        
        // Show success animation
        calculateBtn.classList.add('animate__animated', 'animate__tada');
        setTimeout(() => {
            calculateBtn.classList.remove('animate__animated', 'animate__tada');
        }, 1000);
    }
    
    function addWaterIntake() {
        if (!currentUserId) return;
        
        const amount = parseInt(document.getElementById('water-amount').value);
        
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        const user = users[currentUserId];
        
        // Add to today's intake
        user.todayIntake += amount;
        
        // Add to history with timestamp
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        user.intakeHistory.unshift({
            amount: amount,
            time: timeString,
            timestamp: now.getTime()
        });
        
        // Clear input
        document.getElementById('water-amount').value = '';
        
        // Save to localStorage
        localStorage.setItem('hydrationTrackerData', JSON.stringify(users));
        
        // Update UI
        updateProgress();
        renderIntakeHistory();
        updateChart();
        
        // Show success animation
        addIntakeBtn.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
            addIntakeBtn.classList.remove('animate__animated', 'animate__pulse');
        }, 1000);
        
        // Water droplet animation
        const droplet = document.querySelector('.water-droplet');
        droplet.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            droplet.style.transform = 'translateY(0)';
        }, 500);
    }
    
    function updateProgress() {
        if (!currentUserId) return;
        
        const user = users[currentUserId];
        const percentage = Math.min(Math.round((user.todayIntake / user.dailyGoal) * 100), 100);
        const remaining = user.dailyGoal - user.todayIntake;
        
        progressFill.style.width = `${percentage}%`;
        currentIntake.textContent = `${user.todayIntake}ml`;
        remainingIntake.textContent = `${remaining > 0 ? remaining : 0}ml ${remaining > 0 ? 'remaining' : 'goal achieved!'}`;
        progressText.textContent = `${percentage}% of daily goal`;
        
        // Change color when goal is reached
        if (percentage >= 100) {
            progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--success))';
            remainingIntake.style.color = 'var(--success)';
            remainingIntake.style.fontWeight = '600';
        } else {
            progressFill.style.background = 'linear-gradient(90deg, var(--primary), var(--primary-light))';
            remainingIntake.style.color = '';
            remainingIntake.style.fontWeight = '';
        }
    }
    
    function renderIntakeHistory() {
        if (!currentUserId) return;
        
        const user = users[currentUserId];
        intakeList.innerHTML = '';
        
        if (user.intakeHistory.length === 0) {
            intakeList.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <line x1="6" y1="1" x2="6" y2="4"></line>
                        <line x1="10" y1="1" x2="10" y2="4"></line>
                        <line x1="14" y1="1" x2="14" y2="4"></line>
                    </svg>
                    <p>No water intake recorded today</p>
                </div>
            `;
            return;
        }
        
        // Get today's date for comparison
        const today = new Date();
        const todayDate = today.getDate();
        
        // Filter entries from today only
        const todayEntries = user.intakeHistory.filter(entry => {
            const entryDate = new Date(entry.timestamp).getDate();
            return entryDate === todayDate;
        });
        
        if (todayEntries.length === 0) {
            intakeList.innerHTML = `
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <line x1="6" y1="1" x2="6" y2="4"></line>
                        <line x1="10" y1="1" x2="10" y2="4"></line>
                        <line x1="14" y1="1" x2="14" y2="4"></line>
                    </svg>
                    <p>No water intake recorded today</p>
                </div>
            `;
            return;
        }
        
        todayEntries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'intake-entry animate__animated animate__fadeInUp';
            entryElement.innerHTML = `
                <div class="intake-time">${entry.time}</div>
                <div style="display: flex; align-items: center;">
                    <div class="intake-amount">${entry.amount}ml</div>
                    <button class="intake-delete" data-timestamp="${entry.timestamp}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
            intakeList.appendChild(entryElement);
            
            // Add event listener to delete button
            const deleteBtn = entryElement.querySelector('.intake-delete');
            deleteBtn.addEventListener('click', function() {
                deleteIntakeEntry(entry.timestamp);
            });
        });
    }
    
    function deleteIntakeEntry(timestamp) {
        if (!currentUserId) return;
        
        const user = users[currentUserId];
        
        // Find and remove the entry
        const entryIndex = user.intakeHistory.findIndex(entry => entry.timestamp == timestamp);
        if (entryIndex !== -1) {
            // Subtract from today's intake if it's from today
            const entryDate = new Date(timestamp).getDate();
            const today = new Date().getDate();
            
            if (entryDate === today) {
                user.todayIntake -= user.intakeHistory[entryIndex].amount;
            }
            
            user.intakeHistory.splice(entryIndex, 1);
            
            // Save to localStorage
            localStorage.setItem('hydrationTrackerData', JSON.stringify(users));
            
            // Update UI
            updateProgress();
            renderIntakeHistory();
            updateChart();
        }
    }
    
    function initializeChart() {
        if (!currentUserId) return;
        
        const ctx = document.getElementById('hydration-chart').getContext('2d');
        const user = users[currentUserId];
        
        // Get last 7 days of data
        const last7Days = getLast7DaysData();
        
        hydrationChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days.map(day => day.date),
                datasets: [{
                    label: 'Water Intake',
                    data: last7Days.map(day => day.total),
                    backgroundColor: '#4361ee',
                    borderColor: '#3a56d4',
                    borderWidth: 1,
                    borderRadius: 4,
                    barPercentage: 0.7
                }, {
                    label: 'Daily Goal',
                    data: last7Days.map(() => user.dailyGoal),
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderColor: '#4361ee',
                    borderWidth: 1,
                    type: 'line',
                    fill: false,
                    pointRadius: 0,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Milliliters (ml)',
                            color: '#6c757d'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date',
                            color: '#6c757d'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6c757d'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#495057',
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(27, 38, 59, 0.9)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw}ml`;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    function updateChart() {
        if (!currentUserId || !hydrationChart) return;
        
        const last7Days = getLast7DaysData();
        const user = users[currentUserId];
        
        hydrationChart.data.labels = last7Days.map(day => day.date);
        hydrationChart.data.datasets[0].data = last7Days.map(day => day.total);
        hydrationChart.data.datasets[1].data = last7Days.map(() => user.dailyGoal);
        hydrationChart.update();
    }
    
    function getLast7DaysData() {
        if (!currentUserId) return [];
        
        const user = users[currentUserId];
        const today = new Date();
        const result = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            // Filter entries for this date
            const entriesForDay = user.intakeHistory.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                return (
                    entryDate.getDate() === date.getDate() &&
                    entryDate.getMonth() === date.getMonth() &&
                    entryDate.getFullYear() === date.getFullYear()
                );
            });
            
            const totalForDay = entriesForDay.reduce((sum, entry) => sum + entry.amount, 0);
            
            result.push({
                date: dateString,
                total: totalForDay
            });
        }
        
        return result;
    }
    
    // Reset data at midnight
    function checkForNewDay() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        
        // Check if it's midnight (or close enough)
        if (hours === 0 && minutes === 0) {
            // Reset today's intake for all users
            for (const userId in users) {
                users[userId].todayIntake = 0;
            }
            
            // Save to localStorage
            localStorage.setItem('hydrationTrackerData', JSON.stringify(users));
            
            // Update UI if a user is selected
            if (currentUserId) {
                updateProgress();
                renderIntakeHistory();
                updateChart();
            }
            
            // Update today's date display
            updateTodayDate();
        }
    }
    
    // Check for new day every minute
    setInterval(checkForNewDay, 60000);
});