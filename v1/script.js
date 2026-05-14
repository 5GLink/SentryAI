/**
 * 控制第二套系统配置面板的显示与隐藏
 */
function toggleSecondSystem() {
    const box = document.getElementById('second-system-config');
    const isChecked = document.getElementById('secondSystem').checked;
    box.style.display = isChecked ? 'block' : 'none';
}

/**
 * 执行报价计算逻辑
 */
function calculatePrice() {
    // ------------------------------------------------
    // 1. 定义调整后的参考单价 (2026 DIY/半专业行情)
    // ------------------------------------------------
    const laborPerCam = 85;   // 基础安装调试费（每点位）
    const cablePerFt = 0.45;  // 纯线材成本
    
    // 根据类型和分辨率获取摄像头单价
    const getCamPrice = (type, res) => {
        let price = (type === 'ipc') ? 65 : 45; // 4MP 基础价格：IPC 65, 同轴 45
        
        if (res === '4k') price += 60;
        else if (res === '5mp') price += 20;
        else if (res === '1080p') price -= 20; // 1080P 更便宜
        
        return price;
    };

    // 根据摄像头路数和类型自动匹配主机（NVR/DVR）价格
    const getHostPrice = (type, cams) => {
        if (type === 'ipc') {
            if (cams <= 8) return 180;  // 8路 POE NVR
            if (cams <= 16) return 320; // 16路 POE NVR
            return 550;
        } else {
            if (cams <= 8) return 130;  // 8路同轴 DVR
            if (cams <= 16) return 240; // 16路同轴 DVR
            return 450;
        }
    };

    // ------------------------------------------------
    // 2. 核心计算函数 (单套系统独立计算)
    // ------------------------------------------------
    const getSystemData = (num) => {
        const type = document.getElementById('type' + num).value;
        const cams = parseInt(document.getElementById('cameras' + num).value) || 0;
        const res = document.getElementById('res' + num).value;
        const feet = parseInt(document.getElementById('cable' + num).value) || 0;
        const days = parseInt(document.getElementById('days' + num).value) || 30;
        
        const camPrice = getCamPrice(type, res);
        const hostPrice = getHostPrice(type, cams);
        const hwTotal = cams * camPrice;
        const laborTotal = cams * laborPerCam;
        const cableTotal = feet * cablePerFt;
        
        // 存储容量估算 (GB/天/路 - 动态侦测)
        let dailyGB = (res === '4k') ? 45 : (res === '5mp' ? 25 : (res === '4mp' ? 18 : 12));
        const storageTB = Math.ceil((cams * dailyGB * days) / 1024) || 1;
        
        // 匹配硬盘价格
        let drivePrice = 110; 
        if (storageTB > 4 && storageTB <= 8) drivePrice = 180;
        else if (storageTB > 8) drivePrice = 260;

        return { 
            type, cams, res, feet, days, camPrice, hostPrice, hwTotal, 
            laborTotal, cableTotal, storageTB, drivePrice,
            subTotal: hwTotal + hostPrice + laborTotal + cableTotal + drivePrice 
        };
    };

    // ------------------------------------------------
    // 3. 构建展示 HTML 明细
    // ------------------------------------------------
    const buildHtml = (data, title) => {
        const hostName = (data.type === 'ipc') ? "智能NVR (网络录像机)" : "数字DVR (同轴录像机)";
        const cableName = (data.type === 'ipc') ? "Cat6 网络线材" : "RG59 同轴线材";
        const typeLabel = (data.type === 'ipc') ? "网络数字" : "同轴模拟";

        return `
            <div style="margin-bottom:20px;">
                <strong style="color:#1e40af; border-bottom:1px solid #1e40af; display:block; padding-bottom:5px; margin-bottom:10px;">
                    ${title} <small style="font-weight:normal; color:#64748b;">(${typeLabel})</small>
                </strong>
                <div class="price-item"><span>摄像头 (${data.cams}个 × ${data.res})</span> <span>@$${data.camPrice} <strong>$${data.hwTotal}</strong></span></div>
                <div class="price-item"><span>${hostName}</span> <span><strong>$${data.hostPrice}</strong></span></div>
                <div class="price-item"><span>专用硬盘 (${data.storageTB}TB / ${data.days}天)</span> <span><strong>$${data.drivePrice}</strong></span></div>
                <div class="price-item"><span>${cableName} (${data.feet}ft)</span> <span>@$${cablePerFt} <strong>$${Math.round(data.cableTotal)}</strong></span></div>
                <div class="price-item"><span>安装调试劳务 (${data.cams}点)</span> <span>@$${laborPerCam} <strong>$${data.laborTotal}</strong></span></div>
                <div class="sys-total">系统小计: $${Math.round(data.subTotal).toLocaleString()}</div>
            </div>
        `;
    };

    // 第一套
    const sys1 = getSystemData('1');
    let html = buildHtml(sys1, "[ 第一套系统清单 ]");
    let total = sys1.subTotal;

    // 第二套
    if (document.getElementById('secondSystem').checked) {
        const sys2 = getSystemData('2');
        html += buildHtml(sys2, "[ 第二套系统清单 ]");
        total += sys2.subTotal;
    }

    html += `<div class="grand-total">总计估价: $${Math.round(total).toLocaleString()} USD</div>`;
    html += `<p style="font-size:11px; color:#94a3b8; margin-top:12px; text-align:right;">
                * 参考纽约2026行情（不含销售税）。<br>
                * 线材含接头损耗。存储基于 H.265 动态侦测模式。
             </p>`;

    document.getElementById('result').innerHTML = html;
}