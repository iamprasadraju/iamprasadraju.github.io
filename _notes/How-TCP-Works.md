---
title:  "How TCP Protocol Works ?"
date:   2025-08-10
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
    </style>

# TCP - (Transmission Control Protocol)
---

It’s one of the core protocols of the Internet Protocol Suite (often called <a href="https://en.wikipedia.org/wiki/Transmission_Control_Protocol">TCP/IP</a>). Its main job is to make sure data is sent reliably(no data lost, no duplicates, correct order, no corruption) from one computer to another over a network.

<span style="color: red">Some application of TCP protocol</span>: World Wide Web(HTTP, HTTPS), Email(SMTP, IMAP, POP3), File transfer(FTP), Remote logins(SSH) etc.


## <u>TCP protocol operations</u>

1. Connection Establishment
2. Data Transfer
3. Connection Termination

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Tcp_state_diagram_fixed_new.svg/1920px-Tcp_state_diagram_fixed_new.svg.png">

## <u>TCP segment/packet structure</u>
<hr style="height:10px; visibility:hidden;" />
<b style="color: green">   TCP Packet/Segment = TCP Header + TCP Payload</b>


<img src="https://cdn.jsdelivr.net/gh/qiweiii/myCDN@1.2.1/images/tcp/tcp-seg-wiki.png">

<span style="color: purple; ">**TCP Header**</span>

Source port: 16 bits (2 bytes)
Destination port: 16 bits (2 bytes)
Sequence number: 32 bits (4 bytes)
Acknowledgment number: 32 bits (4 bytes)
Data offset: 4 bits, Reversed: 4 bits

**Flags (8 bits at offset 12)**
- **CWR**: Congestion Window Reduced – 1 bit
- **ECE**: ECN-Echo – 1 bit
- **URG**: Urgent – 1 bit
- **ACK**: Acknowledgement – 1 bit
- **PSH**: Push – 1 bit
- **RST**: Reset – 1 bit
- **SYN**: Synchronize – 1 bit
- **FIN**: Finish – 1 bit
<hr style="height:5px; visibility:hidden;" />


Window: 16 bits
Checksum: 16 bits
Urgent Pointer: 16 bits
options: 0 - 320 bits


<u>TCP Header Size:</u>

Minimum Size: <span style="color: red"> 20 bytes (no options)</span>
Maximum Size: <span style="color: red"> 60 bytes (max allowed options)</span>
