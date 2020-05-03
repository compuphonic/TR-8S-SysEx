# TR-8S-SysEx
Investigation and discovery of the Roland TR-8S SysEx implementation 

The Roland TR-8S is a fun and creative drum machine. A long time wish by users is some means of external memory management.

I've been curious about the existence of the SySEx ID value in the Utility settings, the mysterious CTRL USB Midi port and how the kits on the ARIA site can be transferrred directly to memory.

Using MIDI Monitor app by Snoize on the Mac and initiating the functions on the ARIA site (https://aira.roland.com/soundlibrary-cat/tr-8s/), I was able to sniff the Midi communication.

The files here are some dumps I made from these transfers and are in the native MIDI Monitor file format.

Understanding the SysEx implementation opens the door to the creation of a potential editor for the TR-8S.

However first step is to understand the communication 

The information on Roland SysEx messages by Glenn Meader may help initial efforts (http://www.chromakinetics.com/handsonic/rolSysEx.htm)

The SysEx database is another useful resource for understanding other Roland SysEx implmentations
http://www.sysexdb.com/list.aspx

