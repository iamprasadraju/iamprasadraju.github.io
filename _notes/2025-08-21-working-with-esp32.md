---
layout: page
title: "Working With ESP32"
date: 2025-08-21
---
**ESP32** is a family of low-cost, energy-efficient microcontrollers that integrate both Wi-Fi and Bluetooth capabilities. These chips feature a variety of processing options, including the Tensilica Xtensa LX6 microprocessor available in both dual-core and single-core variants, the Xtensa LX7 dual-core processor, or a single-core RISC-V microprocessor. In addition, the ESP32 incorporates components essential for wireless data communication such as built-in antenna switches, an RF balun, power amplifiers, low-noise receivers, filters, and power-management modules.

![ESP32 Overview](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/_images/esp32-devkitc-v4-functional-overview.png)

### Specs:

1. **Processor**: CPU: Xtensa dual-core (or single-core) 32-bit LX6, Operating on 160 - 240 MHz
2. **Memory**: 520kb RAM, 448kb ROM
3. **Wireless connectivity**: Wi-Fi: 802.11 b/g/n, Bluetooth: v4.2 BR/EDR and BLE (shares the radio with Wi-Fi)

---

### Softwares and Tools:

**USB-to-UART Drivers:** To Establish Serial Connection with ESP32 ➡️ [Download Drivers](https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers)

**ESP-IDF (SDK)**: For C/C++ builds. (Low-level code -----> ESP-IDF -----> Machine Code). It comes with cross-compiler toolchain, Debugger, Linker etc.
➡️ [**Github**](https://github.com/espressif/esp-idf), [**Get Started (ESP-IDF)**](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html)

**esptool** : A Python-based, open-source, platform-independent serial utility for flashing, provisioning, and interacting with Espressif SoCs. [**Documentation**](https://docs.espressif.com/projects/esptool/en/latest/esp32/esptool/index.html)

**Installation** -
```bash
pip install esptool
```

Useful commands are: `esptool erase_flash` -> Erase all flash memory

---

# MICRO-PYTHON

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/MicroPython_new_logo.svg/1920px-MicroPython_new_logo.svg.png" width="10%"/>

**MicroPython** is a software implementation of a programming language largely compatible with Python 3, written in C, that is optimized to run on a microcontroller.

MicroPython consists of a Python compiler to bytecode and a runtime interpreter of that bytecode. The user is presented with an interactive prompt (the REPL) to execute supported commands immediately. Included are a selection of core Python libraries; MicroPython includes modules which give the programmer access to low-level hardware.

MicroPython does have an inline assembler, which lets the code run at full speed, but it is not portable across different microcontrollers.

[Download MicroPython Firmware](https://micropython.org/download/)

**Flashing MicroPython Firmware** - `esptool.py --baud 460800 write_flash 0x1000 ESP32_BOARD_NAME-DATE-VERSION.bin`

**Install Firmware -- USE REPL (to interact and run micropython) -- Build Projects**

➡️ [**MicroPython Docs**](https://docs.micropython.org/en/latest/index.html)

### Softwares and Tools:

**mpremote** - The mpremote command line tool provides an integrated set of utilities to remotely interact with, manage the filesystem on, and automate a MicroPython device over a serial connection.

1. **connect** - connect to specified device via name: `$ mpremote connect <device>`
2. **repl** - enter the REPL on the connected device: `$ mpremote repl [--options]`

For more commands visit [Manual](https://docs.micropython.org/en/latest/reference/mpremote.html)

**WebREPL** -
WebREPL allows you to use the Python prompt over WiFi, connecting through a browser. The latest versions of Firefox and Chrome are supported.

1. Single connection/channel, multiplexing terminal access, filesystem access, and board control.
2. Network ready and Web technologies ready (allowing access directly from a browser with an HTML-based client).

**Setup** - 
1. Install MicroPython Firmware
2. Connect device and PC to same Wifi network
3. Enter REPL mode
4. Run - `import webrepl_setup`
5. Enable WebREPL mode, it will show WebREPL server started on `http://192.168.31.169:8266/`

![WebREPL](https://i0.wp.com/blog.oshpark.com/wp-content/uploads/2018/10/webrepl-browser.png?w=656&h=516&ssl=1)

ESP32 datasheet - [https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf)

---

# Development using C++ on ESPs

1. Install Python (for more check `https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/linux-macos-setup.html#get-started-prerequisites`)

2. Install ESP-IDF on your system. **Github** : `https://github.com/espressif/esp-idf` or Download latest esp-idf zip.

```bash
cd esp-idf
```

3. Run `./install.sh all`. After successful installation:
*Issue you might encounter - doesn’t trust the SSL certificate authority chain when trying to download toolchains for ESP-IDF.*

To fix this run these commands:

```bash
/Applications/Python\ 3.13/Install\ Certificates.command
```

```bash
/Library/Frameworks/Python.framework/Versions/3.13/bin/python3 -m pip install --upgrade pip certifi
```

```bash
python3 -m ssl
```
If you don’t see errors, SSL is now configured correctly.

4. Then activate the ESP-IDF environment (adds toolchain to your path):

```bash
source export.sh
```

