# Nginx 站点片段（本仓库维护，在服务器上启用）

## `2048.yunhujiang.top` → 本机 `127.0.0.1:9000`

1. 在域名 DNS 增加 **A 记录**：主机记录 `2048`，值为本机 **公网 IPv4**（与 `yunhujiang.top:9000` 所用机器一致）。
2. 服务器已安装 Nginx，且本机 **`127.0.0.1:9000`** 上 2048 服务已运行。
3. 将 `2048.yunhujiang.top.conf` 拷到服务器后执行：

```bash
sudo cp 2048.yunhujiang.top.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/2048.yunhujiang.top.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

4. 浏览器访问 `http://2048.yunhujiang.top` 应等同原 `http://yunhujiang.top:9000/`（走 80 端口，无需写 `:9000`）。

### HTTPS（可选）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d 2048.yunhujiang.top
```

Certbot 会在配置中追加 `listen 443 ssl` 等；之后建议用防火墙仅对公网开放 80/443，**不必**对公网开放 9000。

### 若 `nginx -t` 报 `server_name` 冲突

检查 `sites-enabled/` 里是否已有同名 `server_name`；合并到同一 `server` 或删掉重复站点。
