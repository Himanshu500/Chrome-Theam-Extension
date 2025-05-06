// Digital clock with animation effects
class DigitalClock {
  constructor() {
    this.timeDisplay = document.getElementById('time-display');
    this.dateDisplay = document.getElementById('date-display');
    this.is24HourFormat = true;
    this.flashingColon = true;
    
    this.init();
  }
  
  init() {
    // Update the clock immediately
    this.updateClock();
    
    // Update the clock every second
    setInterval(() => this.updateClock(), 1000);
  }
  
  updateClock() {
    const now = new Date();
    
    // Format time based on 24-hour or 12-hour preference
    let hours = now.getHours();
    let ampm = '';
    
    if (!this.is24HourFormat) {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12 for 12 AM
    }
    
    // Format hours, minutes, and seconds with leading zeros
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(now.getMinutes()).padStart(2, '0');
    const formattedSeconds = String(now.getSeconds()).padStart(2, '0');
    
    // Create colon that can flash
    const colon = this.flashingColon && now.getSeconds() % 2 === 0 ? ' ' : ':';
    
    // Construct the time string
    const timeString = `${formattedHours}${colon}${formattedMinutes}${colon}${formattedSeconds}${ampm}`;
    
    // Update the time display
    this.timeDisplay.textContent = timeString;
    
    // Apply subtle animation
    this.animateDigitChange();
    
    // Format and set the date
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    const dateString = now.toLocaleDateString(undefined, options);
    this.dateDisplay.textContent = dateString;
  }
  
  animateDigitChange() {
    // Add a subtle pulse animation to the clock on change
    this.timeDisplay.classList.add('pulse');
    
    // Remove the animation class after it completes
    setTimeout(() => {
      this.timeDisplay.classList.remove('pulse');
    }, 500);
  }
  
  // Toggle between 24-hour and 12-hour format
  toggleTimeFormat() {
    this.is24HourFormat = !this.is24HourFormat;
    this.updateClock();
  }
  
  // Toggle flashing colon
  toggleFlashingColon() {
    this.flashingColon = !this.flashingColon;
  }
}

// Initialize clock on page load
window.addEventListener('DOMContentLoaded', () => {
  window.clock = new DigitalClock();
}); 