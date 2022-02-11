# keeplocal

Keeplocal allows you to control the cloud connectivity of your local smart devices.

## Installation

Get the source code:
```bash
git clone https://github.com/mfucci/keeplocal.git
cd keeplocal
```

Patch bugs in dhcp-mon:
```bash
sed -i 's/export ;//g' node_modules/dhcp-mon/out/index.d.ts
sed -i 's/ClassIdOption extends BufferOption/ClassIdOption extends Utf8Option/g' node_modules/dhcp-mon/out/index.d.ts
sed -i 's/ClassIdOption extends BufferOption/ClassIdOption extends Utf8Option/g' node_modules/dhcp-mon/out/index.js
```

Build and install:
```bash
npm run build
sudo npm install -g
```

## Network preparation

On your local device:
* switch to permanently use a static IP
* manualy specify DNS / gateway IPs
* make sure that you can still access the internet

On your router:
* WARNING:  this will temporary disconnect all your local devices using dynamic IPs
* disable IPv6
* disable the DHCP service for IPv4

## Usage

Start the daemon:
```bash
sudo keeplocal-daemon
```

List all the devices connected on your network:
```bash
keeplocal list
```

List all the devices connected on your network:
```bash
keeplocal list
```

Prevent a device to access the cloud:
```bash
keeplocal gate <device_mac>
```

Give back access the cloud:
```bash
keeplocal ungate <device_mac>
```

## Advanced usage

Keeplocal actually declares the device running keeplocal as the router for gated devices, so you can use ```bash route ``` command to whitelist specific servers.

## Uninstall

Turn back on the DHCP server on your router.
