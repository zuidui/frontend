document.addEventListener('DOMContentLoaded', function () {
    fetch('/footer.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('#footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
});
