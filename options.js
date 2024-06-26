document.addEventListener('DOMContentLoaded', function() {
    loadItems();
});

function loadItems() {
    chrome.storage.sync.get(null, function(items) {
        let container = document.getElementById('items-container');
        container.innerHTML = '';
        for (let key in items) {
            let item = items[key];
            let itemElement = createItemElement(key, item);
            container.appendChild(itemElement);
        }
    });
}

function createItemElement(key, item) {
    let div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
        <h3>${item.type}</h3>
        <p>${item.content}</p>
        <textarea>${item.note || ''}</textarea>
        <button class="save-btn">保存筆記</button>
        <span class="delete-btn">刪除</span>
    `;

    div.querySelector('.save-btn').addEventListener('click', function() {
        let note = div.querySelector('textarea').value;
        saveNote(key, note);
    });

    div.querySelector('.delete-btn').addEventListener('click', function() {
        deleteItem(key);
    });

    return div;
}

function saveNote(key, note) {
    chrome.storage.sync.get(key, function(result) {
        let item = result[key];
        item.note = note;
        chrome.storage.sync.set({ [key]: item }, function() {
            console.log('筆記已保存');
        });
    });
}

function deleteItem(key) {
    chrome.storage.sync.remove(key, function() {
        console.log('項目已刪除');
        loadItems();  // 重新加載項目列表
    });
}
