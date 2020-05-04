// The data in the JS code below is base64-encoded JSON.
// It decodes to the following:
//{
//    "temp": {
//        "sys": {
//            "categoryName": {
//                "address": [0x00, 0x01, 0x00, 0x00],
//                "blockSize": 0,
//                "dataSize": 16,
//                "dataStep": 0x10,
//                "dataCount": 32
//            }
//        },
//        "stp": {
//            "currentKit": {
//                "address": [0x01, 0x00, 0x00, 0x00],
//                "blockSize": 0,
//                "dataSize": 1
//            },
//            "currentPattern": {
//                "address": [0x01, 0x00, 0x00, 0x01],
//                "blockSize": 0,
//                "dataSize": 1
//            },
//            "nextPattern": {
//                "address": [0x01, 0x00, 0x00, 0x02],
//                "blockSize": 0,
//                "dataSize": 1
//            },
//            "patternSelect": {
//                "address": [0x01, 0x00, 0x00, 0x1B],
//                "blockSize": 0,
//                "dataSize": 4
//            }
//        },
//        "ptn": {
//            "name": {
//                "address": [0x20, 0x00, 0x00, 0x00],
//                "blockSize": [0x10, 0x00, 0x00],
//                "dataSize": 16
//            },
//            "kitReference": {
//                "address": [0x20, 0x00, 0x00, 0x14],
//                "blockSize": [0x10, 0x00, 0x00],
//                "dataSize": 2
//            },
//            "kitReferenceSw": {
//                "address": [0x20, 0x00, 0x01, 0x06],
//                "blockSize": [0x10, 0x00, 0x00],
//                "dataSize": 1
//            }
//        },
//        "kit": {
//            "name": {
//                "address": [0x10, 0x00, 0x00, 0x00],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 16
//            },
//            "toneId": {
//                "address": [0x10, 0x00, 0x10, 0x00],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 16,
//                "dataStep": [0x01, 0x00],
//                "dataCount": 11
//            }
//        },
//        "tone": {
//            "name": {
//                "address": [0x30, 0x00, 0x00, 0x00],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 16
//            },
//            "category": {
//                "address": [0x30, 0x00, 0x00, 0x10],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 1
//            },
//            "type": {
//                "address": [0x30, 0x00, 0x00, 0x11],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 1
//            },
//            "address": {
//                "address": [0x40, 0x00, 0x00, 0x00],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 8
//            },
//            "addressRight": {
//                "address": [0x40, 0x00, 0x00, 0x08],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 8
//            },
//            "size": {
//                "address": [0x40, 0x00, 0x00, 0x10],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 8
//            },
//            "channel": {
//                "address": [0x40, 0x00, 0x00, 0x38],
//                "blockSize": [0x01, 0x00, 0x00],
//                "dataSize": 1
//            }
//        },
//    },
//    "utility": {
//        "address": [0x50, 0x00, 0x00, 0x00],
//        "offsets": {
//            "command": {
//                "playing": 0x10,
//                "lock": 0x11,
//                "display": 0x12,
//                "version": 0x13,
//                "uid": 0x14,
//                "optimize": 0x20,
//                "freeArea": 0x21,
//                "freeToneCount": 0x22,
//                "freeTone": 0x23,
//                "deleteTone": 0x24
//            },
//            "get": {
//                "system": 0x31,
//                "pattern": 0x41,
//                "kit": 0x51,
//                "tone": 0x61,
//                "pcmTone": 0x71,
//                "sample": 0x73
//            },
//            "send": {
//                "system": 0x30,
//                "pattern": 0x40,
//                "kit": 0x50,
//                "tone": 0x60,
//                "pcmTone": 0x70,
//                "sample": 0x72,
//                "firmApp": 0x74,
//                "firmParam": 0x75
//            },
//            "data": {
//                "1": [0x01, 0x00],
//                "2": [0x01, 0x01],
//                "4": [0x01, 0x02],
//                "8": [0x01, 0x03],
//                "16": [0x01, 0x04],
//                "32": [0x01, 0x05],
//                "64": [0x01, 0x06],
//                "128": [0x01, 0x07],
//                "256": [0x01, 0x08],
//                "512": [0x01, 0x09],
//                "1024": [0x01, 0x0A],
//                "progress": [0x01, 0x10]
//            },
//            "write": {
//                "system": 0x00,
//                "pattern": 0x01,
//                "kit": 0x02,
//                "tone": 0x03
//            }
//        },
//        "size": {
//            "system": 752,
//            "pattern": 24504,
//            "kit": 1312,
//            "tone": 36,
//            "pcmTone": 64
//        },
//        "chunkId": {
//            "system": "SYS ",
//            "pattern": "PTN ",
//            "kit": "KIT ",
//            "tone": "TONE",
//            "pcmTone": "PCMT",
//            "sample": "SMPL"
//        }
//    },
//    "presetCategory": ["IMPORT", "BD", "SD", "TOM", "RS", "HC", "CH/OH", "CC/RC", "PERC1", "PERC2", "PERC3", "PERC4", "PERC5", "FX/HIT", "VOICE", "SYNTH1", "SYNTH2", "BASS", "SCALED", "CHORD", "OTHERS"],
//    "storageSize": 0x03300000,
//    "minPatternId": 0,
//    "maxPatternId": 127,
//    "minKitId": 0,
//    "maxKitId": 127,
//    "minToneId": 624,
//    "maxToneId": 1023,
//    "minSampleSector": 104,
//    "maxSampleSector": 511,
//    "sampleSectorSize": 0x00020000,
//    "minSampleAddress": 0x00D00000,
//    "maxSampleAddress": 0x03FFFFFF,
//    "firmAppName": "rpg42_m0c0a_up.bin",
//    "firmParamName": "rpg42_init_param.bin"
//}
export const TR8S_DATA = 'eyJ0ZW1wIjp7InN5cyI6eyJjYXRlZ29yeU5hbWUiOnsiYWRkcmVzcyI6WzB4MDAsMHgwMSwweDAwLDB4MDBdLCJibG9ja1NpemUiOjAsImRhdGFTaXplIjoxNiwiZGF0YVN0ZXAiOjB4MTAsImRhdGFDb3VudCI6MzJ9fSwic3RwIjp7ImN1cnJlbnRLaXQiOnsiYWRkcmVzcyI6WzB4MDEsMHgwMCwweDAwLDB4MDBdLCJibG9ja1NpemUiOjAsImRhdGFTaXplIjoxfSwiY3VycmVudFBhdHRlcm4iOnsiYWRkcmVzcyI6WzB4MDEsMHgwMCwweDAwLDB4MDFdLCJibG9ja1NpemUiOjAsImRhdGFTaXplIjoxfSwibmV4dFBhdHRlcm4iOnsiYWRkcmVzcyI6WzB4MDEsMHgwMCwweDAwLDB4MDJdLCJibG9ja1NpemUiOjAsImRhdGFTaXplIjoxfSwicGF0dGVyblNlbGVjdCI6eyJhZGRyZXNzIjpbMHgwMSwweDAwLDB4MDAsMHgxQl0sImJsb2NrU2l6ZSI6MCwiZGF0YVNpemUiOjR9fSwicHRuIjp7Im5hbWUiOnsiYWRkcmVzcyI6WzB4MjAsMHgwMCwweDAwLDB4MDBdLCJibG9ja1NpemUiOlsweDEwLDB4MDAsMHgwMF0sImRhdGFTaXplIjoxNn0sImtpdFJlZmVyZW5jZSI6eyJhZGRyZXNzIjpbMHgyMCwweDAwLDB4MDAsMHgxNF0sImJsb2NrU2l6ZSI6WzB4MTAsMHgwMCwweDAwXSwiZGF0YVNpemUiOjJ9LCJraXRSZWZlcmVuY2VTdyI6eyJhZGRyZXNzIjpbMHgyMCwweDAwLDB4MDEsMHgwNl0sImJsb2NrU2l6ZSI6WzB4MTAsMHgwMCwweDAwXSwiZGF0YVNpemUiOjF9fSwia2l0Ijp7Im5hbWUiOnsiYWRkcmVzcyI6WzB4MTAsMHgwMCwweDAwLDB4MDBdLCJibG9ja1NpemUiOlsweDAxLDB4MDAsMHgwMF0sImRhdGFTaXplIjoxNn0sInRvbmVJZCI6eyJhZGRyZXNzIjpbMHgxMCwweDAwLDB4MTAsMHgwMF0sImJsb2NrU2l6ZSI6WzB4MDEsMHgwMCwweDAwXSwiZGF0YVNpemUiOjE2LCJkYXRhU3RlcCI6WzB4MDEsMHgwMF0sImRhdGFDb3VudCI6MTF9fSwidG9uZSI6eyJuYW1lIjp7ImFkZHJlc3MiOlsweDMwLDB4MDAsMHgwMCwweDAwXSwiYmxvY2tTaXplIjpbMHgwMSwweDAwLDB4MDBdLCJkYXRhU2l6ZSI6MTZ9LCJjYXRlZ29yeSI6eyJhZGRyZXNzIjpbMHgzMCwweDAwLDB4MDAsMHgxMF0sImJsb2NrU2l6ZSI6WzB4MDEsMHgwMCwweDAwXSwiZGF0YVNpemUiOjF9LCJ0eXBlIjp7ImFkZHJlc3MiOlsweDMwLDB4MDAsMHgwMCwweDExXSwiYmxvY2tTaXplIjpbMHgwMSwweDAwLDB4MDBdLCJkYXRhU2l6ZSI6MX0sImFkZHJlc3MiOnsiYWRkcmVzcyI6WzB4NDAsMHgwMCwweDAwLDB4MDBdLCJibG9ja1NpemUiOlsweDAxLDB4MDAsMHgwMF0sImRhdGFTaXplIjo4fSwiYWRkcmVzc1JpZ2h0Ijp7ImFkZHJlc3MiOlsweDQwLDB4MDAsMHgwMCwweDA4XSwiYmxvY2tTaXplIjpbMHgwMSwweDAwLDB4MDBdLCJkYXRhU2l6ZSI6OH0sInNpemUiOnsiYWRkcmVzcyI6WzB4NDAsMHgwMCwweDAwLDB4MTBdLCJibG9ja1NpemUiOlsweDAxLDB4MDAsMHgwMF0sImRhdGFTaXplIjo4fSwiY2hhbm5lbCI6eyJhZGRyZXNzIjpbMHg0MCwweDAwLDB4MDAsMHgzOF0sImJsb2NrU2l6ZSI6WzB4MDEsMHgwMCwweDAwXSwiZGF0YVNpemUiOjF9fSx9LCJ1dGlsaXR5Ijp7ImFkZHJlc3MiOlsweDUwLDB4MDAsMHgwMCwweDAwXSwib2Zmc2V0cyI6eyJjb21tYW5kIjp7InBsYXlpbmciOjB4MTAsImxvY2siOjB4MTEsImRpc3BsYXkiOjB4MTIsInZlcnNpb24iOjB4MTMsInVpZCI6MHgxNCwib3B0aW1pemUiOjB4MjAsImZyZWVBcmVhIjoweDIxLCJmcmVlVG9uZUNvdW50IjoweDIyLCJmcmVlVG9uZSI6MHgyMywiZGVsZXRlVG9uZSI6MHgyNH0sImdldCI6eyJzeXN0ZW0iOjB4MzEsInBhdHRlcm4iOjB4NDEsImtpdCI6MHg1MSwidG9uZSI6MHg2MSwicGNtVG9uZSI6MHg3MSwic2FtcGxlIjoweDczfSwic2VuZCI6eyJzeXN0ZW0iOjB4MzAsInBhdHRlcm4iOjB4NDAsImtpdCI6MHg1MCwidG9uZSI6MHg2MCwicGNtVG9uZSI6MHg3MCwic2FtcGxlIjoweDcyLCJmaXJtQXBwIjoweDc0LCJmaXJtUGFyYW0iOjB4NzV9LCJkYXRhIjp7IjEiOlsweDAxLDB4MDBdLCIyIjpbMHgwMSwweDAxXSwiNCI6WzB4MDEsMHgwMl0sIjgiOlsweDAxLDB4MDNdLCIxNiI6WzB4MDEsMHgwNF0sIjMyIjpbMHgwMSwweDA1XSwiNjQiOlsweDAxLDB4MDZdLCIxMjgiOlsweDAxLDB4MDddLCIyNTYiOlsweDAxLDB4MDhdLCI1MTIiOlsweDAxLDB4MDldLCIxMDI0IjpbMHgwMSwweDBBXSwicHJvZ3Jlc3MiOlsweDAxLDB4MTBdfSwid3JpdGUiOnsic3lzdGVtIjoweDAwLCJwYXR0ZXJuIjoweDAxLCJraXQiOjB4MDIsInRvbmUiOjB4MDN9fSwic2l6ZSI6eyJzeXN0ZW0iOjc1MiwicGF0dGVybiI6MjQ1MDQsImtpdCI6MTMxMiwidG9uZSI6MzYsInBjbVRvbmUiOjY0fSwiY2h1bmtJZCI6eyJzeXN0ZW0iOiJTWVMgIiwicGF0dGVybiI6IlBUTiAiLCJraXQiOiJLSVQgIiwidG9uZSI6IlRPTkUiLCJwY21Ub25lIjoiUENNVCIsInNhbXBsZSI6IlNNUEwifX0sInByZXNldENhdGVnb3J5IjpbIklNUE9SVCIsIkJEIiwiU0QiLCJUT00iLCJSUyIsIkhDIiwiQ0gvT0giLCJDQy9SQyIsIlBFUkMxIiwiUEVSQzIiLCJQRVJDMyIsIlBFUkM0IiwiUEVSQzUiLCJGWC9ISVQiLCJWT0lDRSIsIlNZTlRIMSIsIlNZTlRIMiIsIkJBU1MiLCJTQ0FMRUQiLCJDSE9SRCIsIk9USEVSUyJdLCJzdG9yYWdlU2l6ZSI6MHgwMzMwMDAwMCwibWluUGF0dGVybklkIjowLCJtYXhQYXR0ZXJuSWQiOjEyNywibWluS2l0SWQiOjAsIm1heEtpdElkIjoxMjcsIm1pblRvbmVJZCI6NjI0LCJtYXhUb25lSWQiOjEwMjMsIm1pblNhbXBsZVNlY3RvciI6MTA0LCJtYXhTYW1wbGVTZWN0b3IiOjUxMSwic2FtcGxlU2VjdG9yU2l6ZSI6MHgwMDAyMDAwMCwibWluU2FtcGxlQWRkcmVzcyI6MHgwMEQwMDAwMCwibWF4U2FtcGxlQWRkcmVzcyI6MHgwM0ZGRkZGRiwiZmlybUFwcE5hbWUiOiJycGc0Ml9tMGMwYV91cC5iaW4iLCJmaXJtUGFyYW1OYW1lIjoicnBnNDJfaW5pdF9wYXJhbS5iaW4ifQ==';
