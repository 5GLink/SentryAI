const i18n = {
    zh: {
        title: "监控系统安装报价",
        mode: "服务模式",
        modeFull: "全包 (设备 + 人工)",
        modeLabor: "纯人工 (客户自带设备)",
        cameraCount: "摄像头数量",
        location: "安装地区",
        totalLabel: "预计总报价 (含税预计):",
        disclaimer: "* 本报价参考2026年纽约当地行情。实际价格受布线难度（大理石、挑高屋顶等）影响，以现场勘测为准。",
        feeNote: "包含地区附加费/过桥费: $",
        distFee: "里程费将根据具体地址计算"
    },
    en: {
        title: "CCTV Installation Estimate",
        mode: "Service Mode",
        modeFull: "Full Service (Equipment + Labor)",
        modeLabor: "Labor Only (Customer Provides Gear)",
        cameraCount: "Number of Cameras",
        location: "Installation Area",
        totalLabel: "Estimated Total:",
        disclaimer: "* Estimates based on 2026 NYC market rates. Final price depends on wiring complexity and on-site survey.",
        feeNote: "Area/Toll Surcharge included: $",
        distFee: "Distance fee based on exact mileage"
    }
};

let currentLang = 'zh';

function switchLang(lang) {
    currentLang = lang;
    const t = i18n[lang];
    document.getElementById('ui-title').innerText = t.title;
    document.getElementById('ui-mode').innerText = t.mode;
    document.getElementById('ui-mode-full').innerText = t.modeFull;
    document.getElementById('ui-mode-labor').innerText = t.modeLabor;
    document.getElementById('ui-camera-count').innerText = t.cameraCount;
    document.getElementById('ui-location').innerText = t.location;
    document.getElementById('ui-total-label').innerText = t.totalLabel;
    document.getElementById('ui-disclaimer').innerText = t.disclaimer;
    calculate();
}

function calculate() {
    const count = parseInt(document.getElementById('cameraCount').value) || 0;
    const mode = document.getElementById('mode').value;
    const loc = document.getElementById('location').value;

    const baseLaborPerCamera = 150; 
    const equipmentPerCamera = 100; 
    
    let total = 0;
    
    // 1. 基础费计算
    if (mode === 'full') {
        total = count * (baseLaborPerCamera + equipmentPerCamera);
    } else {
        total = count * baseLaborPerCamera;
    }

    // 2. 地区附加费逻辑
    let extra = 0;
    if (loc === 'manhattan') {
        extra = 100; // 曼哈顿固定费用
    } else if (loc === 'bridge') {
        // 过桥费阶梯计算 (Bronx, SI, Upstate)
        if (count >= 1 && count <= 7) {
            extra = 20;
        } else if (count >= 8 && count <= 16) {
            extra = 40; // 20 x 2
        } else if (count >= 17) {
            extra = 60;
        }
    } else if (loc === 'long-distance') {
        extra = 80; // 远距离基础预设
    }

    total += extra;

    // 3. 渲染
    document.getElementById('totalPrice').innerText = total;
    
    const breakdown = document.getElementById('price-breakdown');
    const t = i18n[currentLang];
    
    if (loc === 'long-distance') {
        breakdown.innerText = t.distFee;
    } else if (extra > 0) {
        breakdown.innerText = t.feeNote + extra;
    } else {
        breakdown.innerText = "";
    }
}

calculate();