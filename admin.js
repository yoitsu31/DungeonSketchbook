document.addEventListener('DOMContentLoaded', function() {
    loadItems();
    setupEventListeners();
});

function loadItems() {
    chrome.storage.sync.get(null, function(items) {
        const tableBody = document.querySelector('#content-table tbody');
        tableBody.innerHTML = '';
        for (let key in items) {
            const item = items[key];
            const row = createTableRow(key, item);
            tableBody.appendChild(row);
        }
    });
}

function createTableRow(key, item) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.type}</td>
        <td>${formatContent(item)}</td>
        <td>${item.tags ? item.tags.join(', ') : ''}</td>
        <td>${item.note || ''}</td>
        <td>
            <button class="action-btn edit-btn" data-key="${key}">編輯</button>
            <button class="action-btn delete-btn" data-key="${key}">刪除</button>
        </td>
    `;
    return row;
}

function formatContent(item) {
    if (item.type === 'image' || item.type === 'screenshot') {
        return `<img src="${item.content}" style="max-width:100px; max-height:100px;">`;
    }
    return item.content.length > 50 ? item.content.substring(0, 50) + '...' : item.content;
}

function setupEventListeners() {
    const modal = document.getElementById('edit-modal');
    const closeBtn = modal.querySelector('.close');
    const addNewBtn = document.getElementById('add-new-btn');

    document.getElementById('content-table').addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            openEditModal(e.target.dataset.key);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteItem(e.target.dataset.key);
        }
    });

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById('edit-form').onsubmit = function(e) {
        e.preventDefault();
        saveItem();
    }

    addNewBtn.onclick = function() {
        openEditModal();
    }
}

function openEditModal(key) {
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-form');
    
    if (key) {
        chrome.storage.sync.get(key, function(result) {
            const item = result[key];
            form.querySelector('#edit-key').value = key;
            form.querySelector('#edit-type').value = item.type;
            form.querySelector('#edit-content').value = item.content;
            form.querySelector('#edit-tags').value = item.tags ? item.tags.join(', ') : '';
            form.querySelector('#edit-note').value = item.note || '';
        });
    } else {
        form.reset();
        form.querySelector('#edit-key').value = '';
    }

    modal.style.display = "block";
}

function saveItem() {
    const form = document.getElementById('edit-form');
    const key = form.querySelector('#edit-key').value || Date.now().toString();
    const item = {
        type: form.querySelector('#edit-type').value,
        content: form.querySelector('#edit-content').value,
        tags: form.querySelector('#edit-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        note: form.querySelector('#edit-note').value,
        timestamp: parseInt(key)
    };

    chrome.storage.sync.set({ [key]: item }, function() {
        console.log('Item saved');
        loadItems();
        document.getElementById('edit-modal').style.display = "none";
    });
}

function deleteItem(key) {
    if (confirm('確定要刪除這個項目嗎？')) {
        chrome.storage.sync.remove(key, function() {
            console.log('Item deleted');
            loadItems();
        });
    }
}
