# keeplocal

[![license](https://img.shields.io/badge/license-Apache2-green.svg?style=flat)](https://raw.githubusercontent.com/mfucci/keeplocal/master/LICENSE)

Keeplocal allows you to control the cloud connectivity of your local smart devices.

## Installation

Get the source code:

```bash
git clone https://github.com/mfucci/keeplocal.git
cd keeplocal
npm install
```

Build and install:

```bash
npm run build
sudo npm install -g
```

## Network preparation

On your local device:

- switch to permanently use a static IP
- manualy specify DNS / gateway IPs
- make sure that you can still access the internet

On your router:

- WARNING: this will temporary disconnect all your local devices using dynamic IPs
- disable IPv6
- disable the DHCP service for IPv4

## Usage

Start the daemon:

```bash
sudo keeplocal daemon
```

List all the devices connected on your network:

```bash
keeplocal list
```

List all the devices connected on your network:

```bash
keeplocal list
```

Rename a device to identify it better:

```bash
keeplocal rename <device_mac> <name>
```

Prevent a device to access the cloud:

```bash
keeplocal gate <device_mac>
```

Give back access the cloud:

```bash
keeplocal ungate <device_mac>
```

## Automatically start on boot

Install the service configuration:

```bash
sudo cp conf/keeplocal.service /etc/systemd/system/
```

Activate and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable keeplocal
sudo systemctl start keeplocal
```

Check status and logs:

```bash
systemctl status keeplocal
```

## Advanced usage

Keeplocal actually declares the device running keeplocal as the router for gated devices, so you can use `bash route ` command to whitelist specific servers.

## Uninstall

Turn back on the DHCP server on your router.
