// Add hover effects to releases
document.querySelectorAll('.release').forEach(item => {
    item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-5px)';
    });
    item.addEventListener('mouseleave', () => {
        item.style.transform = 'none';
    });
});