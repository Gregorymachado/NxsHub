#define UNICODE
#define _UNICODE
#include <windows.h>
#include <wrl.h>
#include <wil/com.h>
#include <string>
#include <objbase.h>
#include <fstream>
#include <vector>
#include <shlobj.h>
#include <chrono>
#include <iomanip>
#include <thread>
#include <algorithm>
#include <filesystem>
#include <unordered_map>
#include "WebView2.h"
#include "WebView2EnvironmentOptions.h"

#pragma comment (lib, "Ole32.lib")
#pragma comment (lib, "Shell32.lib")
#pragma comment (lib, "User32.lib")
#pragma comment (lib, "Shlwapi.lib")

namespace fs = std::filesystem;
using namespace Microsoft::WRL;

static wil::com_ptr<ICoreWebView2Controller> webviewController;
static wil::com_ptr<ICoreWebView2> webview;
static wil::com_ptr<ICoreWebView2Environment> webviewEnvironment;
static HWND g_hWnd;
bool userAuthenticated = false;
std::wstring currentUser = L"";
bool isFullScreen = false;
RECT prevWindowRect;

void SendDebugLog(std::wstring origin, std::wstring msg) {
    if (webview) {
        std::wstring sanitizedMsg = msg;
        size_t pos = 0;
        while ((pos = sanitizedMsg.find(L"'", pos)) != std::wstring::npos) {
            sanitizedMsg.replace(pos, 1, L"\\'");
            pos += 2;
        }
        std::wstring js = L"if(window.nxs && typeof window.nxs.log === 'function') { window.nxs.log('" + origin + L"', '" + sanitizedMsg + L"'); }";
        webview->ExecuteScript(js.c_str(), nullptr);
    }
}

void Log(std::wstring msg) {
    std::wofstream f(L"debug.log", std::ios::app);
    auto now = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
    struct tm timeinfo;
    localtime_s(&timeinfo, &now);
    f << L"[" << std::put_time(&timeinfo, L"%H:%M:%S") << L"] " << msg << std::endl;
    SendDebugLog(L"C++", msg);
}

std::wstring GetExecutableDir() {
    wchar_t exePath[MAX_PATH];
    GetModuleFileNameW(NULL, exePath, MAX_PATH);
    std::wstring path = exePath;
    return path.substr(0, path.find_last_of(L"\\/")) + L"\\";
}

std::wstring GetUIPath() {
    return GetExecutableDir() + L"src\\index.html";
}

void UpdateWebViewBounds(HWND hWnd) {
    if (webviewController) {
        RECT r; GetClientRect(hWnd, &r);
        webviewController->put_Bounds(r);
    }
}

void ToggleFullScreen(HWND hWnd) {
    isFullScreen = !isFullScreen;
    if (isFullScreen) {
        GetWindowRect(hWnd, &prevWindowRect);
        SetWindowLong(hWnd, GWL_STYLE, WS_POPUP | WS_VISIBLE);
        SetWindowPos(hWnd, HWND_TOP, 0, 0, GetSystemMetrics(SM_CXSCREEN), GetSystemMetrics(SM_CYSCREEN), SWP_FRAMECHANGED | SWP_SHOWWINDOW);
    } else {
        SetWindowLong(hWnd, GWL_STYLE, WS_OVERLAPPEDWINDOW | WS_VISIBLE);
        SetWindowPos(hWnd, NULL, prevWindowRect.left, prevWindowRect.top, prevWindowRect.right - prevWindowRect.left, prevWindowRect.bottom - prevWindowRect.top, SWP_FRAMECHANGED | SWP_SHOWWINDOW);
    }
}

void GoHome() {
    if (webview) {
        webview->Navigate((L"file:///" + GetUIPath() + L"?logged=true").c_str());
    }
}

LRESULT CALLBACK KeyboardHook(int nCode, WPARAM wp, LPARAM lp) {
    if (nCode == HC_ACTION && wp == WM_KEYDOWN) {
        KBDLLHOOKSTRUCT* key = (KBDLLHOOKSTRUCT*)lp;
        if (GetForegroundWindow() == g_hWnd) {
            bool ctrl = (GetAsyncKeyState(VK_CONTROL) & 0x8000);
            
            if (key->vkCode == VK_F11 || (ctrl && key->vkCode == 'F')) {
                ToggleFullScreen(g_hWnd);
                return 1;
            }

            if (ctrl) {
                if (key->vkCode == VK_ESCAPE) { GoHome(); return 1; }
                if (key->vkCode == 'R') { webview->Reload(); return 1; }
                if (key->vkCode == 'M') { webview->ExecuteScript(L"if(typeof toggleThemeMusic === 'function') { toggleThemeMusic(); } else { const v=document.querySelector('video'); if(v) v.muted=!v.muted; }", nullptr); return 1; }
                if (key->vkCode == 'B') { webview->ExecuteScript(L"const v=document.querySelector('video');if(v){const t=v.currentTime;v.load();v.currentTime=t;v.play();}", nullptr); return 1; }
                if (key->vkCode == 'A') { webview->ExecuteScript(L"if(typeof toggleSocial === 'function') toggleSocial();", nullptr); return 1; }
                if (key->vkCode == 'L') { webview->PostWebMessageAsJson(L"{\"type\":\"toggle_logs\"}"); return 1; }
            }
        }
    }
    return CallNextHookEx(NULL, nCode, wp, lp);
}

LRESULT CALLBACK WndProc(HWND hWnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
    case WM_SIZE: UpdateWebViewBounds(hWnd); break;
    case WM_DESTROY: PostQuitMessage(0); break;
    default: return DefWindowProc(hWnd, msg, wp, lp);
    }
    return 0;
}

int APIENTRY wWinMain(HINSTANCE hI, HINSTANCE, LPWSTR, int nS) {
    CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    WNDCLASSEX wcex = { sizeof(WNDCLASSEX), CS_HREDRAW | CS_VREDRAW, WndProc, 0, 0, hI, (HICON)LoadImage(hI, MAKEINTRESOURCE(1), IMAGE_ICON, 32, 32, 0), LoadCursor(NULL, IDC_ARROW), NULL, NULL, L"NXS_APP", NULL };
    RegisterClassEx(&wcex);
    g_hWnd = CreateWindow(L"NXS_APP", L"NxsHub Media Center", WS_OVERLAPPEDWINDOW, CW_USEDEFAULT, CW_USEDEFAULT, 1280, 720, NULL, NULL, hI, NULL);

    HHOOK hhkLowLevelKybd = SetWindowsHookEx(WH_KEYBOARD_LL, KeyboardHook, hI, 0);

    auto opts = Microsoft::WRL::Make<CoreWebView2EnvironmentOptions>();
    opts->put_AdditionalBrowserArguments(L"--autoplay-policy=no-user-gesture-required "
        L"--allow-file-access-from-files "
        L"--disable-web-security "
        L"--disable-site-isolation-trials "
        L"--disable-features=BlockInsecurePrivateNetworkRequests,TrackingPrevention,IsolateOrigins,site-per-process,CrossSiteDocumentBlockingIfIsolating "
        L"--ignore-certificate-errors "
        L"--ignore-gpu-blocklist "
        L"--enable-gpu-rasterization "
        L"--enable-zero-copy "
        L"--user-agent=\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36\"");

    CreateCoreWebView2EnvironmentWithOptions(nullptr, (GetExecutableDir() + L"NXS_CACHE").c_str(), opts.Get(),
        Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>(
        [](HRESULT res, ICoreWebView2Environment* env) -> HRESULT {
            if (FAILED(res)) return res;
            webviewEnvironment = env;
            return env->CreateCoreWebView2Controller(g_hWnd, Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>(
            [](HRESULT res2, ICoreWebView2Controller* ctrl) -> HRESULT {
                if (SUCCEEDED(res2) && ctrl) {
                    webviewController = ctrl;
                    webviewController->get_CoreWebView2(&webview);
                    UpdateWebViewBounds(g_hWnd);
                    webviewController->put_IsVisible(TRUE);

                    webview->CallDevToolsProtocolMethod(L"Network.clearBrowserCache", L"{}", nullptr);

                    wil::com_ptr<ICoreWebView2Settings> settings;
                    webview->get_Settings(&settings);
                    if (settings) {
                        settings->put_IsWebMessageEnabled(TRUE);
                        settings->put_IsScriptEnabled(TRUE);
                        settings->put_AreDefaultContextMenusEnabled(TRUE);
                        settings->put_AreDevToolsEnabled(TRUE);
                    }

                    webview->add_NavigationStarting(Callback<ICoreWebView2NavigationStartingEventHandler>(
                        [](ICoreWebView2* sender, ICoreWebView2NavigationStartingEventArgs* args) -> HRESULT {
                            sender->AddScriptToExecuteOnDocumentCreated(
                                L"window.onbeforeunload = null; "
                                L"Object.defineProperty(window, 'onbeforeunload', { value: null, writable: false, configurable: false }); "
                                L"window.addEventListener('keydown', function(e) { if(e.keyCode == 123) e.stopImmediatePropagation(); }, true); "
                                L"const origAssign = window.location.assign; window.location.assign = function(url) { if((url.indexOf('betteranime') !== -1 || url.indexOf('anim.lol') !== -1 || url.indexOf('goyabu') !== -1 || url.indexOf('animeshd.to') !== -1) && (url === '/' || url === 'https://betteranime.net/')) return; origAssign.apply(this, arguments); }; "
                                L"const origReplace = window.location.replace; window.location.replace = function(url) { if((url.indexOf('betteranime') !== -1 || url.indexOf('anim.lol') !== -1 || url.indexOf('goyabu') !== -1 || url.indexOf('animeshd.to') !== -1) && (url === '/' || url === 'https://betteranime.net/')) return; origReplace.apply(this, arguments); };", 
                                nullptr);
                            return S_OK;
                        }).Get(), nullptr);

                    webview->add_NavigationCompleted(Callback<ICoreWebView2NavigationCompletedEventHandler>(
                        [](ICoreWebView2* sender, ICoreWebView2NavigationCompletedEventArgs* args) -> HRESULT {
                            auto agora = std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());
                            struct tm t; localtime_s(&t, &agora);
                            int mes = t.tm_mon; 
                            int dia = t.tm_mday;
                            if (mes == 9 && dia == 31) sender->PostWebMessageAsJson(L"{\"type\":\"easter_egg\",\"theme\":\"halloween\"}");
                            else if (mes == 11 && dia == 25) sender->PostWebMessageAsJson(L"{\"type\":\"easter_egg\",\"theme\":\"christmas\"}");
                            return S_OK;
                        }).Get(), nullptr);

                    webviewController->add_AcceleratorKeyPressed(Callback<ICoreWebView2AcceleratorKeyPressedEventHandler>(
                        [](ICoreWebView2Controller* sender, ICoreWebView2AcceleratorKeyPressedEventArgs* args) -> HRESULT {
                            COREWEBVIEW2_KEY_EVENT_KIND kind;
                            if (SUCCEEDED(args->get_KeyEventKind(&kind))) {
                                if (kind == COREWEBVIEW2_KEY_EVENT_KIND_KEY_DOWN) {
                                    UINT key;
                                    if (SUCCEEDED(args->get_VirtualKey(&key))) {
                                        if (key == VK_ESCAPE) {
                                            webview->PostWebMessageAsJson(L"{\"type\":\"toggle_dashboard\"}");
                                            args->put_Handled(TRUE);
                                        }
                                    }
                                }
                            }
                            return S_OK;
                        }).Get(), nullptr);

                    webview->add_NewWindowRequested(Callback<ICoreWebView2NewWindowRequestedEventHandler>(
                        [](ICoreWebView2* sender, ICoreWebView2NewWindowRequestedEventArgs* args) -> HRESULT {
                            LPWSTR uri;
                            args->get_Uri(&uri);
                            std::wstring wUri(uri);
                            if (wUri.find(L"betteranime") == std::wstring::npos && 
                                wUri.find(L"imgcontent") == std::wstring::npos && 
                                wUri.find(L"anim.lol") == std::wstring::npos && 
                                wUri.find(L"goyabu.io") == std::wstring::npos &&
                                wUri.find(L"animeshd.to") == std::wstring::npos) {
                                args->put_Handled(TRUE);
                            }
                            CoTaskMemFree(uri);
                            return S_OK;
                        }).Get(), nullptr);

                    webview->AddWebResourceRequestedFilter(L"*", COREWEBVIEW2_WEB_RESOURCE_CONTEXT_ALL);
                    webview->add_WebResourceRequested(Callback<ICoreWebView2WebResourceRequestedEventHandler>(
                        [](ICoreWebView2* sender, ICoreWebView2WebResourceRequestedEventArgs* args) -> HRESULT {
                            wil::com_ptr<ICoreWebView2WebResourceRequest> request;
                            args->get_Request(&request);
                            if (request) {
                                LPWSTR uri;
                                request->get_Uri(&uri);
                                std::wstring wUri(uri);

                                wil::com_ptr<ICoreWebView2HttpRequestHeaders> headers;
                                request->get_Headers(&headers);
                                if (headers) {
                                    if (wUri.find(L"anim.lol") != std::wstring::npos) {
                                        headers->SetHeader(L"Referer", L"https://anim.lol/");
                                        headers->SetHeader(L"Origin", L"https://anim.lol");
                                    } else if (wUri.find(L"goyabu.io") != std::wstring::npos) {
                                        headers->SetHeader(L"Referer", L"https://goyabu.io/");
                                        headers->SetHeader(L"Origin", L"https://goyabu.io");
                                    } else if (wUri.find(L"animeshd.to") != std::wstring::npos) {
                                        headers->SetHeader(L"Referer", L"https://animeshd.to/");
                                        headers->SetHeader(L"Origin", L"https://animeshd.to");
                                    } else if (wUri.find(L"betteranime") != std::wstring::npos || 
                                        wUri.find(L"imgcontent") != std::wstring::npos || 
                                        wUri.find(L"cdn") != std::wstring::npos) {
                                        headers->SetHeader(L"Referer", L"https://betteranime.io/");
                                        headers->SetHeader(L"Origin", L"https://betteranime.io");
                                        headers->SetHeader(L"Sec-Fetch-Site", L"same-origin");
                                    } else if (wUri.find(L"piratatvs") != std::wstring::npos || wUri.find(L"cloudfront-net.online") != std::wstring::npos) {
                                        headers->SetHeader(L"Referer", L"https://piratatvs.com/");
                                        headers->SetHeader(L"Origin", L"https://piratatvs.com");
                                    } else if (wUri.find(L"google") == std::wstring::npos && wUri.find(L"youtube") == std::wstring::npos) {
                                        headers->SetHeader(L"Referer", L"https://rdcplayer.online/");
                                        headers->SetHeader(L"Origin", L"https://rdcplayer.online");
                                    }
                                }
                                CoTaskMemFree(uri);
                            }
                            return S_OK;
                        }).Get(), nullptr);

                    webview->add_WebMessageReceived(Callback<ICoreWebView2WebMessageReceivedEventHandler>(
                        [](ICoreWebView2* sender, ICoreWebView2WebMessageReceivedEventArgs* args) -> HRESULT {
                            LPWSTR msg; 
                            if (SUCCEEDED(args->TryGetWebMessageAsString(&msg))) {
                                std::wstring sMsg(msg);
                                if (sMsg == L"encerrar_app") {
                                    PostQuitMessage(0);
                                } else if (sMsg.find(L"\"type\":\"get_playlist\"") != std::wstring::npos) {
                                    size_t folderPos = sMsg.find(L"\"folder\":\"") + 10;
                                    size_t folderEnd = sMsg.find(L"\"", folderPos);
                                    std::wstring folderName = sMsg.substr(folderPos, folderEnd - folderPos);
                                    std::wstring baseDir = GetExecutableDir() + L"src\\Musicas\\" + folderName + L"\\";
                                    std::wstring jsonArr = L"[";
                                    try {
                                        if (fs::exists(baseDir)) {
                                            for (const auto& entry : fs::directory_iterator(baseDir)) {
                                                if (entry.path().extension() == ".mp3" || entry.path().extension() == ".wav") {
                                                    std::wstring p = entry.path().wstring();
                                                    std::replace(p.begin(), p.end(), L'\\', L'/');
                                                    jsonArr += L"\"file:///" + p + L"\",";
                                                }
                                            }
                                        }
                                    } catch (...) {}
                                    if (jsonArr.back() == L',') jsonArr.pop_back();
                                    jsonArr += L"]";
                                    webview->ExecuteScript((L"receberPlaylist(" + jsonArr + L");").c_str(), nullptr);
                                } else if (sMsg == L"toggle_fullscreen" || sMsg == L"{\"type\":\"toggle_fullscreen\"}") {
                                    ToggleFullScreen(g_hWnd);
                                } else if (sMsg.find(L"http") == 0 || sMsg.find(L"www") == 0 || sMsg.find(L"file") == 0) {
                                    webview->Navigate(sMsg.c_str());
                                } else {
                                    std::wstring exeDir = GetExecutableDir();
                                    std::wstring srcPath = exeDir + L"src\\";
                                    std::wstring syncInPath = srcPath + L"sync_in.json";
                                    std::wofstream f(syncInPath);
                                    if (f.is_open()) {
                                        f << sMsg; f.close();
                                        std::thread([exeDir, srcPath, syncInPath, sMsg]() {
                                            std::wstring syncPath = L"\"" + exeDir + L"sync.exe\"";
                                            wchar_t* cmd = _wcsdup(syncPath.c_str());
                                            std::wstring syncOutPath = srcPath + L"sync_out.txt";
                                            STARTUPINFO si = { sizeof(si) }; PROCESS_INFORMATION pi;
                                            if (CreateProcess(NULL, cmd, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, exeDir.c_str(), &si, &pi)) {
                                                WaitForSingleObject(pi.hProcess, 20000);
                                                CloseHandle(pi.hProcess); CloseHandle(pi.hThread);
                                                Sleep(500);
                                                bool fileRead = false;
                                                std::string resultData = "";
                                                for (int i = 0; i < 50; i++) {
                                                    std::ifstream rf(syncOutPath);
                                                    if (rf.is_open()) {
                                                        std::string line;
                                                        while (std::getline(rf, line)) {
                                                            if (line.find("log|") == 0) {
                                                                std::string pyLog = line.substr(4);
                                                                SendDebugLog(L"PY", std::wstring(pyLog.begin(), pyLog.end()));
                                                            } else {
                                                                resultData += line + "\n";
                                                            }
                                                        }
                                                        rf.close();
                                                        if (!resultData.empty()) { fileRead = true; break; }
                                                    }
                                                    Sleep(200);
                                                }
                                                if (fileRead) {
                                                    size_t pos = 0;
                                                    std::string delimiter = "\n";
                                                    while ((pos = resultData.find(delimiter)) != std::string::npos) {
                                                        std::string line = resultData.substr(0, pos);
                                                        if (!line.empty()) {
                                                            std::wstring wline(line.begin(), line.end());
                                                            if (line.find("ui_update|") == 0) {
                                                                std::wstring jsData = wline.substr(10);
                                                                webview->PostWebMessageAsString((L"{\"type\":\"ui_update\",\"data\":" + jsData + L"}").c_str());
                                                            } else {
                                                                webview->PostWebMessageAsString(wline.c_str());
                                                            }
                                                        }
                                                        resultData.erase(0, pos + delimiter.length());
                                                    }
                                                }
                                                DeleteFile(syncOutPath.c_str());
                                            }
                                            DeleteFile(syncInPath.c_str());
                                            free(cmd);
                                        }).detach();
                                    }
                                }
                                CoTaskMemFree(msg);
                            }
                            return S_OK;
                        }).Get(), nullptr);

                    // Load .env and create config.js
                    std::unordered_map<std::string, std::string> envMap;
                    std::ifstream envFile((GetExecutableDir() + L".env"));
                    if (envFile.is_open()) {
                        std::string line;
                        while (std::getline(envFile, line)) {
                            size_t pos = line.find('=');
                            if (pos != std::string::npos) {
                                std::string key = line.substr(0, pos);
                                std::string value = line.substr(pos + 1);
                                envMap[key] = value;
                            }
                        }
                        envFile.close();
                    }
                    std::ofstream configFile((GetExecutableDir() + L"src\\config.js"));
                    if (configFile.is_open()) {
                        configFile << "window.env = {\n";
                        for (auto& p : envMap) {
                            configFile << "  " << p.first << ": '" << p.second << "',\n";
                        }
                        configFile << "};\n";
                        configFile.close();
                    }

                    webview->Navigate((L"file:///" + GetUIPath()).c_str());
                }
                return S_OK;
            }).Get());
        }).Get());

    ShowWindow(g_hWnd, SW_SHOWMAXIMIZED);
    UpdateWindow(g_hWnd);
    MSG msg;
    while (GetMessage(&msg, NULL, 0, 0)) { TranslateMessage(&msg); DispatchMessage(&msg); }
    UnhookWindowsHookEx(hhkLowLevelKybd);
    CoUninitialize();
    return (int)msg.wParam;
}