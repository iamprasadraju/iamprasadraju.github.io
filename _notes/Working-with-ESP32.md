---
title:  "Working With ESP32."
date:   2025-08-21
modified_date: 2026-02-21
summary: ""
tags:
---
<style>
        img{
            display: block;
            max-width: 800px;
            width: 100%;
            height: auto;
            margin: 0 auto;
        }
        a {
            color: blue
        }
        #python{
            display: block;
            max-width: 800px;
            width: 15%;
            height: auto;
            margin: 25px;
        }
        .sub-headers{
            background-color: yellow;
            font-weight: bold

        }
        a:hover{
            color: red;
            background-color: white
            }
    </style>




<span style="font-weight: bold; font-size: 40px; background-color:red">ESP32</span>

---

<span style="font-weight: bold; color: red">ESP32</span> is a family of low-cost, energy-efficient microcontrollers that integrate both Wi-Fi and Bluetooth capabilities. These chips feature a variety of processing options, including the Tensilica Xtensa LX6 microprocessor available in both dual-core and single-core variants, the Xtensa LX7 dual-core processor, or a single-core RISC-V microprocessor. In addition, the ESP32 incorporates components essential for wireless data communication such as built-in antenna switches, an RF balun, power amplifiers, low-noise receivers, filters, and power-management modules.



<img src="https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/_images/esp32-devkitc-v4-functional-overview.png">

**SPECS :**

1. **Processor**: CPU: <span style="color: firebrick">Xtensa dual-core (or single-core)32-bit LX6, Operating on 160 - 240 MHz </span>

2. **Memory**: <span style="color: firebrick">520kb RAM, 448kb ROM</span>

3. **Wireless connectivity**: <span style="color: firebrick"> Wi-Fi: 802.11 b/g/n **,** Bluetooth: v4.2 BR/EDR and BLE (shares the radio with Wi-Fi)</span>


<span style="color: green; font-weight:bold; text-decoration: underline;">Softwares and Tools: </span>

<span class="sub-headers">EUSB-to-UART Drivers:</span> To Establish Serial Connection with ESP32➡️<a style="font-weight: bold" href="https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers">Download Drivers</a>


<span class="sub-headers">ESP-IDF(SDK)</span>: For C/C++ builds. (Low-levl code -----> ESP-IDF -----> Machine Code). It comes with cross-compiler toolchain, Debugger, Linker etc.

➡️ <a href="https://github.com/espressif/esp-idf">**Github**</a>**,**  <a href="https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/index.html">**Get Started (ESP-IDF)**</a>


<span class="sub-headers" >esptool</span> : <span style="color: rebeccapurple">A Python-based, open-source, platform-independent serial utility for flashing, provisioning, and interacting with Espressif SoCs.</span> <a href="https://docs.espressif.com/projects/esptool/en/latest/esp32/esptool/index.html">**Documentation**</a>

<u style="background-color: lightgreen">Installation</u> -
```
    pip install esptool

```
Useful commands are: ```esptool erase_flash``` -> Erase all flash memory

---
<br>

<u style="background-color: lightgreen; font-size: 20px; font-weight: bold">MICRO-PYTHON</u>



<img id="python" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/MicroPython_new_logo.svg/800px-MicroPython_new_logo.svg.png">


**MicroPython** is a software implementation of a programming language largely compatible with Python 3, written in C, that is optimized to run on a microcontroller.

<p>MicroPython consists of a Python compiler to bytecode and a runtime interpreter of that bytecode. The user is presented with an interactive prompt (the REPL) to execute supported commands immediately. Included are a selection of core Python libraries; MicroPython includes modules which give the programmer access to low-level hardware.</p>

<p>MicroPython does have an inline assembler, which lets the code run at full speed, but it is not portable across different microcontrollers.</p>

<a href="https://micropython.org/download/" target="_blank" >Download MicroPython Firmware</a>

<span style="background-color: lightcoral">Flashing MicroPython Firmware</span> **-** <span style="border: 1px solid #ccc;">esptool.py --baud 460800 write_flash 0x1000 ESP32_BOARD_NAME-DATE-VERSION.bin</span>

**Install Firmware -- USE REPL (to interact and run micropyhton) -- Build Projects**

➡️<a href="https://docs.micropython.org/en/latest/index.html">**MicroPython Docs**</a>

<span style="background-color: lightgreen; text-decoration: underline">Softwares and Tools:</span>

<span class="sub-headers">mpremote</span> - The mpremote command line tool provides an integrated set of utilities to remotely interact with, manage the filesystem on, and automate a MicroPython device over a serial connection.

1. **connect** - connect to specified device via name: $ <span style="background-color:lightsteelblue">mpremote connect &lt;device&gt; </span>

2. **repl** - enter the REPL on the connected device: $ <span style="background-color:lightsteelblue">mpremote repl [--options] </span>

For more commands visit <a href="https://docs.micropython.org/en/latest/reference/mpremote.html" target="_blank">Manual</a>

<span class="sub-headers">WebREPL</span> -

<p>WebREPL allows you to use the Python prompt over WiFi, connecting through a browser. The latest versions of Firefox and Chrome are supported.</p>

1. Single connection/channel, multiplexing terminal access, filesystem access, and board control.

2. Network ready and Web technologies ready (allowing access directly from a browser with an HTML-based client).

**setup** - 1. Install MicroPyhton Firmware
        2. Connect device and PC to same Wifi network
        3. Enter REPL mode
        4. Run - **import webrepl_setup**
        5. enable WebREPL mode,
        it show WebREPL server started on <span style="background-color: red">http://192.168.31.169:8266/</span>
<img src="https://i0.wp.com/blog.oshpark.com/wp-content/uploads/2018/10/webrepl-browser.png?w=656&h=516&ssl=1"><br>

ESP32 datasheet - [https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf](https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf)


# Development using C++ on ESPs

1. Install Python (for more if check `https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/linux-macos-setup.html#get-started-prerequisites`)

2. Install ESP-IDF on your system. **Github** : `https://github.com/espressif/esp-idf` or Download latest esp-idf zip.

```bash
    cd esp-idf
```

3. Run ``` ./install.sh all ```, After successful installation.
Issue you might encounter - *doesn’t trust the SSL certificate authority chain when trying to download toolchains for ESP-IDF*

To fix this run these commands

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

<img width="777" height="554" alt="Screenshot 2025-11-03 at 11 43 09 AM" src="https://github.com/user-attachments/assets/ee3db10c-c2bb-48e0-a77e-bc498ef9f3b7" />




last updated on: 3/11/2025
