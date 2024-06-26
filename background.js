chrome.runtime.onInstalled.addListener(() => {
  console.log("擴展已安裝");
  chrome.contextMenus.create({
    id: "saveText",
    title: "儲存選中的文字",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "saveImage",
    title: "儲存圖片",
    contexts: ["image"]
  });
});

chrome.action.onClicked.addListener((tab) => {
  console.log("background.js 嘗試打開側欄");
  chrome.sidePanel.open({ tabId: tab.id }).then(() => {
    console.log("background.js 側欄已打開");
    chrome.tabs.sendMessage(tab.id, { action: "reloadSidepanel" });
  }).catch((error) => {
    console.error("background.js 打開側欄時出錯:", error);
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("background.js 上下文菜單項被點擊:", info.menuItemId);
  if (info.menuItemId === "saveText") {
    chrome.tabs.sendMessage(tab.id, { action: "saveText", text: info.selectionText });
  } else if (info.menuItemId === "saveImage") {
    chrome.tabs.sendMessage(tab.id, { action: "saveImage", srcUrl: info.srcUrl });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("background.js 收到消息:", request);
  if (request.action === "updateSidepanel") {
    chrome.sidePanel.getOptions((options) => {
      if (options) {
        chrome.tabs.sendMessage(options.tabId, {action: "updateSidepanel", newItem: request.newItem});
      }
    });
  }
});
