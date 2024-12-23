async function checkConnection() {
    const hostInput = document.getElementById('hostInput');
    const portInput = document.getElementById('portInput');
    const dnsResult = document.getElementById('dnsResult');
    const portResult = document.getElementById('portResult');
    
    const host = hostInput.value.trim();
    const port = parseInt(portInput.value);

    if (!host) {
        alert('请输入域名');
        return;
    }
    if (!port || port < 1 || port > 65535) {
        alert('请输入有效的端口号（1-65535）');
        return;
    }

    // 重置结果显示
    dnsResult.innerHTML = '正在检测DNS...';
    dnsResult.className = '';
    portResult.innerHTML = '正在检测端口...';
    portResult.className = '';

    try {
        // DNS 解析检测
        const dnsResponse = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}`);
        const dnsData = await dnsResponse.json();

        if (dnsData.Answer) {
            const ips = dnsData.Answer.map(record => record.data).join(', ');
            dnsResult.innerHTML = `解析成功！IP地址：${ips}`;
            dnsResult.className = 'success';

            // 端口检测 - 使用 fetch 超时来模拟端口检测
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

                const testUrl = `https://${host}:${port}/`;
                try {
                    await fetch(testUrl, {
                        mode: 'no-cors',
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    portResult.innerHTML = `端口 ${port} 可能已开放`;
                    portResult.className = 'success';
                } catch (error) {
                    if (error.name === 'AbortError') {
                        portResult.innerHTML = `端口 ${port} 连接超时，可能未开放`;
                    } else {
                        // 如果收到错误响应，通常意味着端口是开放的但被阻止了
                        portResult.innerHTML = `端口 ${port} 已开放但可能被限制访问`;
                    }
                    portResult.className = 'error';
                }
            } catch (error) {
                portResult.innerHTML = '端口检测失败：' + error.message;
                portResult.className = 'error';
            }
        } else {
            dnsResult.innerHTML = '域名解析失败';
            dnsResult.className = 'error';
            return;
        }
    } catch (error) {
        dnsResult.innerHTML = 'DNS检测失败：' + error.message;
        dnsResult.className = 'error';
    }
}

// 添加输入验证
document.getElementById('portInput').addEventListener('input', function(e) {
    let value = parseInt(e.target.value);
    if (value < 1) e.target.value = 1;
    if (value > 65535) e.target.value = 65535;
}); 