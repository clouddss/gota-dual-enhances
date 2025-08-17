
class ModalSystem {
    static modals = []
    static currentModal = null
    static isAnimating = false

    static init() {
        document.querySelectorAll("[data-modal-id]").forEach((modal) => {
            const modalObj = {
                overlay: modal,
                container: modal.querySelector(".modal-container"),
                closeBtn: modal.querySelector(".modal-close"),
                id: modal.dataset.modalId
            }

            modalObj.closeBtn.addEventListener("click", () => this.close())
            modalObj.overlay.addEventListener("click", (e) => {
                if (e.target === modalObj.overlay) this.close()
            })

            this.modals.push(modalObj)
        })

        document.querySelectorAll("[data-modal-target]").forEach((btn) => {
            btn.addEventListener("click", () => this.open(btn.dataset.modalTarget))
        })

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.currentModal) this.close()
        })
    }

    static open(id) {
        if (this.isAnimating) return

        const modal = this.modals.find((m) => m.id === id)
        if (!modal || this.currentModal === modal) return

        this.isAnimating = true
        this.currentModal = modal

        modal.overlay.style.display = "flex"
        setTimeout(() => {
            modal.overlay.classList.add("active")
            this.isAnimating = false
        }, 10)
    }

    static close() {
        if (this.isAnimating || !this.currentModal) return

        this.isAnimating = true
        const modal = this.currentModal

        modal.overlay.classList.remove("active")
        setTimeout(() => {
            modal.overlay.style.display = "none"
            this.currentModal = null
            this.isAnimating = false
        }, 300)
    }
}

ModalSystem.init()

var version
var showSideMenu
var hideSideMenu
var macroIntervalID
var macroIterations = 1
var mousefix = 0
var toggleMass = false
var toggleName = false
var toggleSkins = false
var toggleChat = false
var onScreenIcons = [];
var soloTrickSplit = false;

function show_side_menu(element_id) {
    // Renamed function
    var element = $("#" + element_id)
    // Keep var here as it's function-scoped
    if (element.css("display") == "none") {
        hide_side_menu()
        // Call renamed function
        element.slideDown(500)
    }
}

function hide_side_menu() {
    // Renamed function
    $("#main-right")
        .children()
        .each(function () {
            if ($(this).css("display") == "block") {
                $(this).slideUp(500)
            }
        })
}

function init_game() {
    // Security checks interval is started in the 'authenticated' message handler now
    console.log("Dual Enhancements: Security checks configured (will start after auth).")

    // Initialize WebSocket connection

    // var switchedServers = false;
    var window_pixi = window.PIXI
    const PIXI = window_pixi
    var app
    var stage = null
    var uiContainer = null
    var uiContainer = null
    var borderContainer = null
    var gameContainer = null
    var foodContainer = null
    var cellContainer = null
    var markerContainer = null;
    var overlaySprite = null
    if (PIXI && PIXI.settings) {
        stage = new PIXI.Container()
        uiContainer = new PIXI.Container()
        borderContainer = new PIXI.Container()
        gameContainer = new PIXI.Container()
        foodContainer = new PIXI.Container()
        markerContainer = new PIXI.Container(PIXI.Texture.EMPTY);
        cellContainer = new PIXI.Container()
        overlaySprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
        // var borderGraphic; // Unused variable
        gameContainer.addChild(borderContainer)
        gameContainer.addChild(foodContainer)
        gameContainer.addChild(markerContainer);
        gameContainer.addChild(cellContainer)
        stage.addChild(uiContainer)
        stage.addChild(gameContainer)
        stage.addChild(overlaySprite)

        // Optimize rendering by disabling interaction checks for containers that don't need them
        if (foodContainer) foodContainer.interactiveChildren = false

        // Border container doesn't need interaction checks for children
        if (borderContainer) borderContainer.interactiveChildren = false

        if (markerContainer) markerContainer.interactiveChildren = false
    }

    let mainMenuVisible = true

    // Game variables
    var canvas, scorePanel2, scorePanelTwo, minimap_canvas, minimapContext, player1, player2, network, lastFrameTime
    var mainUI,
        partyPanel,
        leaderboardHeader,
        scrimmageMenu,
        scrimmageCustom,
        accumulatedTime = 0,
        fpsCounter = 0,
        scorePanel
    var borderGraphic = null
    // Border graphic for game boundaries
    var pingTimestamp = 0
    // Timestamp for ping measurement
    var isServerSwitching = false,
        selectedServer,
        isAccountLocked = false
    var socialData = {
        elements: [],
        callbacks: [],
        pendingFriends: [],
        timestamps: []
    }
    var isFriendsInitialized = false
    // Flag to track if friends list has been initialized
    var chatCommands = []
    var messageOfTheDay
    // Stores the current message of the day
    var hudPanel
    // HUD panel in the game interface
    var globalUserData = null
    var globalUser2Data = null
    var globalLBShown = false
    var globalLBShown2 = false
    var dualmodeGlobalCamX = -1
    var dualmodeGlobalCamY = -1


    //////
    var hasSplit = false

    const circleTextureCacheInternal = new Map()
    /**
     * Function to handle window unload events - saves user settings
     */
    function handleWindowUnload() {
        saveUserSettings()
    }

    // Constants
    const TWO_PI = Math.PI * 2
    const BASE_CELL_SIZE = 128,
        DOUBLE_CELL_SIZE = BASE_CELL_SIZE * 2
    const CELL_BORDER_SIZE = (BASE_CELL_SIZE + 6) * 2,
        HALF_CELL_SIZE = BASE_CELL_SIZE / 2

    // Temporary variables
    var tempX, tempY, tempZ
    // Circle textures of different sizes
    const hudElements = {}
    // Constants for external services
    const DISCORD_CHANNEL_URL = "https://discord.com/channels/166703751053312000/630428963889741854"
    const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
    const ACCOUNTS_URL = "https://accounts.gota.io"
    var eventSettings = {
        key: "halloween2023",
        foodColors: [15633692, 11224098, 9453167, 6301513],
        customEjectedMass: false,
        motd: "",
        endDate: 17305056e5,
        enabled: false,
        motherCustomEnabled: false,
        motherCustom: function (cell) { },
        happyMotherCells: []
    }
    eventSettings.enabled = new Date() < eventSettings.endDate

    // Keybinds management
    let activeKeybinds = {}
    // Cache for keybind values

    // Load keybinds from localStorage
    function loadKeybindsCache() {
        console.log("Loading/Reloading keybinds cache...")
        activeKeybinds = {}
        // Clear previous cache
        try {
            // Load the single 'keybinds' item
            const savedBindsString = localStorage.getItem("keybinds")
            const savedBinds = savedBindsString ? JSON.parse(savedBindsString) : {}
            // Merge saved binds with defaults (defaultKeyMappings holds defaults)
            activeKeybinds = {
                ...defaultKeyMappings,
                ...savedBinds
            }
        } catch (e) {
            console.error("Error loading/parsing keybinds from localStorage, using defaults.", e)
            activeKeybinds = {
                ...defaultKeyMappings
            }
            // Fallback to defaults on error
        }
    }

    // Save keybinds to localStorage
    function saveKeybindsToStorage() {
        try {
            // Save the current state of the main keyMappings object
            localStorage.setItem("keybinds", JSON.stringify(keyMappings))
            console.log("Saved keybinds to localStorage.")
        } catch (e) {
            console.error("Error saving keybinds to localStorage:", e)
        }
    }

    // duplicateNameBox();

    /**
     * Shows a notification for camera mode changes
     * @param {string} message - The message to display in the notification
     */
    function showsCameraModeNotification(message) {
        // Clear any existing notifications
        $("#camera-mode-notification").empty()

        // Create and style the notification
        var notification = $('<div class="camera-mode-alert">' + message + "</div>")
        notification.css({
            "background-color": "rgba(0, 0, 0, 0.8)",
            "color": "#ffffff",
            "padding": "10px 15px",
            "border-radius": "5px",
            "font-family": "Arial, sans-serif",
            "font-size": "14px",
            "font-weight": "bold",
            "text-align": "center",
            "box-shadow": "0 0 10px rgba(0, 0, 0, 0.5)",
            "border": "1px solid rgba(255, 255, 255, 0.3)",
            "margin-bottom": "10px",
            "opacity": "0",
            "transition": "opacity 0.3s ease-in-out"
        })

        // Add to the notification container
        $("#camera-mode-notification").append(notification)

        // Animation sequence: fade in, wait, fade out, remove
        setTimeout(function () {
            notification.css("opacity", "1")

            setTimeout(function () {
                notification.css("opacity", "0")

                setTimeout(function () {
                    notification.remove()
                }, 300)
                // Remove after fade out completes
            }, 2000)
            // Show for 2 seconds
        }, 10)
        // Small delay before starting fade in
    }

    /**
     * Shows a notification with a countdown timer.
     * @param {number} durationSeconds - The duration of the countdown in seconds.
     * @param {string} [prefixMessage='Connecting Player 2 in '] - Optional message prefix.
     */
    function showCountdownNotification(durationSeconds, prefixMessage = "Connecting Player 2 in ") {
        // Ensure the notification container exists
        if ($("#camera-mode-notification").length === 0) {
            $('<div id="camera-mode-notification" style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000;"></div>').appendTo(document.body)
        }

        const container = $("#camera-mode-notification")
        container.empty() // Clear previous notifications

        let remainingSeconds = durationSeconds

        // Create notification element with a span for the timer
        const notification = $('<div class="camera-mode-alert">' + prefixMessage + '<span class="countdown-timer">' + remainingSeconds + "</span>s</div>")
        notification.css({
            "background-color": "rgba(0, 0, 0, 0.8)",
            "color": "#ffffff",
            "padding": "10px 15px",
            "border-radius": "5px",
            "font-family": "Arial, sans-serif",
            "font-size": "14px",
            "font-weight": "bold",
            "text-align": "center",
            "box-shadow": "0 0 10px rgba(0, 0, 0, 0.5)",
            "border": "1px solid rgba(255, 255, 255, 0.3)",
            "margin-bottom": "10px",
            "opacity": "0",
            "transition": "opacity 0.3s ease-in-out"
        })

        container.append(notification)

        // Fade in
        setTimeout(() => {
            notification.css("opacity", "1")
        }, 10)

        // Start the countdown interval
        const intervalId = setInterval(() => {
            remainingSeconds--
            notification.find(".countdown-timer").text(remainingSeconds)

            if (remainingSeconds <= 0) {
                clearInterval(intervalId)
                // Fade out and remove
                notification.css("opacity", "0")
                setTimeout(() => {
                    notification.remove()
                }, 300) // Remove after fade out
            }
        }, 1000) // Update every second
    }

    // Initialize Firebase safely (prevent duplicate initialization)
    try {
        // Try to get existing Firebase apps first
        fb_app1 = firebase.app("fb_app1")
        console.log("Using existing Firebase app: fb_app1")
    } catch (e) {
        // If app doesn't exist, initialize it
        try {
            fb_app1 = firebase.initializeApp(
                {
                    apiKey: "AIzaSyCmYFIIazBPyg5goqvPb-7uA6W9-4TVqEM",
                    authDomain: "accounts.gota.io",
                    databaseURL: "https://gota-io.firebaseio.com",
                    projectId: "gota-io",
                    storageBucket: "gota-io.appspot.com",
                    messagingSenderId: "570450309042",
                    appId: "1:570450309042:web:380ab6c94d44de2f"
                },
                "fb_app1"
            )
            console.log("Created new Firebase app: fb_app1")
        } catch (initError) {
            console.error("Error initializing Firebase app fb_app1:", initError)
        }
    }

    try {
        // Try to get existing Firebase app first
        fb_app2 = firebase.app("fb_app2")
        console.log("Using existing Firebase app: fb_app2")
    } catch (e) {
        // If app doesn't exist, initialize it
        try {
            fb_app2 = firebase.initializeApp(
                {
                    apiKey: "AIzaSyCmYFIIazBPyg5goqvPb-7uA6W9-4TVqEM",
                    authDomain: "accounts.gota.io",
                    databaseURL: "https://gota-io.firebaseio.com",
                    projectId: "gota-io",
                    storageBucket: "gota-io.appspot.com",
                    messagingSenderId: "570450309042",
                    appId: "1:570450309042:web:380ab6c94d44de2f"
                },
                "fb_app2"
            )
            console.log("Created new Firebase app: fb_app2")
        } catch (initError) {
            console.error("Error initializing Firebase app fb_app2:", initError)
        }
    }

    // Storage for server data
    var serverList = {}
    var serverListFunctions = {}
    // Client configuration

    var clientOptions = {
        massType: 0,
        levelMass: 3,
        levelNames: 3,
        levelSkins: 3,
        textOutlineSize: 9,
        resolution: 1
    }

    // Chat configuration
    var defaultChatTabs = [
        {
            name: "All",
            flags: 255,
            maxMessages: 100
        },
        {
            name: "Party",
            flags: 2,
            maxMessages: 100
        }
    ]
    var currentChatTabIndex = 0
    var chatHistory = []
    // Array to store chat message history
    var chatHistoryIndex = -1
    // Index for navigating chat history
    var partyCodeVariable = null
    // Variable to store party code from URL

    var clientSettings = {
        cDisableAA: false,
        cAutoRespawn: false,
        cHideId: false,
        cHideServer: false,
        sShowMass: "ALL",
        sShowNames: "ALL",
        sShowSkins: "ALL",
        sRenderType: "AUTO",
        sTextOutlines: "THICK",
        sQuality: "ULTRA",
        sMassType: "DEFAULT",
        sFastFeed: "MouseCursor",
        cTransCells: false,
        cShowBorder: false,
        cSilentLogin: false,
        cHideChat: false,
        cHideMinimap: false,
        sScorePanel: "2",
        cShowCoordinates: false,
        cShowChunks: false,
        cHideFood: false,
        cColoredPing: false,
        cColoredCellCount: false,
        cThemeEnabled: false,
        cDisableAutoZoom: false,
        cAutoDecline: false,
        cDualMode: true,
        mouseFollow: false,
        cReplaceBotsName: false,
        // mouse follow
        cCursorLine: false,
        sCosmetic: "None",
        // New setting for showing the trajectory of cells
        cCellRing: false,
        // New setting for Indicating which cell is being controlled
        cShowThreatIndicators: false,
        // New setting for threat indicators on minimap
        cCustomCellColors: false,
        // New setting for custom cell colors
        cPartnerHighlightEnabled: false,
        // New setting for the highlight feature
        sCameraMode: "default",
        cDisableEventSkins: false,
        cResizableChat: false,
        cDisableAutoNameHiding: false,
        cDisableAutoFoodHiding: false,
        cDisablePersistEjectMass: false,
        iChatWidth: "360px",
        iChatHeight: "250px",
        rUiScale: 1,
        rReconnectPeriod: 5,
        rAnimationDelay: 90,
        rViewDistance: 150,
        rCamDelay: 50,
        sLinesplitMode: "TOGGLE",
        // Set default to uppercase TOGGLE
        _ChatTabs: JSON.parse(JSON.stringify(defaultChatTabs)),

        // will put here for now
        soloMothership: false,


        // Show Case
        cMyModFeatureEnabled: true,
        // Default for checkbox
        sMyModMode: "DEFAULT",
        // Default for dropdown
        rMyModVolume: 75,
        // Default for slider (use 'r' prefix)
        rLinesplitThreshold: 5
        // Default for slider (use 'r' prefix)
    }
    let previousShowMass = "ALL"
    let previousShowNames = clientSettings.sShowNames
    // Default to ALL (3)

    // Initialize keyMappings object
    var keyMappings = {
        kContextMenu: 3,
        kEjectMass: 87,
        kSplit: 32,
        kToggleSpec: 81,
        kDoubleSplit: -1,
        kTripleSplit: -1,
        kQuadSplit: -1,
        kHexaSplit: -1,
        kFreezeMouse: -1,
        kSwitchTab: 9,
        kAutoReverse1X: -1,
        kAutoReverse2X: -1,
        kDiagLine: -1,
        kBiggestCellMode: -1,
        kLineSplit: 76,
        kFastFeed: -1,
        kFastFeedMode: -1,
        kTrickSplit: -1,
        kSoloTrick: -1,
        kInfernoSplit: -1,
        kFixCellLocation: -1,
        kToggleThreatIndicators: 73,
        kToggleShowMass: 77,
        kToggleHideChat: 72,
        kToggleHideSkins: 83,
        kToggleShowNames: 78,
        kMarkDenger: 74,
        kMarkFood: 75,
        kMarkDirection: 188,
        kSoloMs: -1,
        kMouseFollow: -1,
        kMultiSplit: -1,
        kMultiDouble: -1,
        kMultiMax: -1,
        kMultiEject: -1,
        kDualMode: -1
    }
    // B key for Biggest Cell mode
    // UI and theme configuration
    var isKeybindEditMode = false
    // Flag to indicate if we're in keybind edit mode
    const defaultKeyMappings = Object.assign({}, keyMappings)
    const UI_THEME_VERSION = 2
    const MINIMAP_COLUMN_TEXT = ["A", "B", "C", "D", "E"]
    const MINIMAP_ROW_TEXT = ["1", "2", "3", "4", "5"]

    // Theme settings
    const uiTheme = {
        version: UI_THEME_VERSION,
        uiForegroundColor: "rgb(255, 255, 255)",
        uiBackgroundColor: "rgba(22, 22, 22, 0.8)",
        uiBorderColor: "rgba(255, 255, 255, .2)",
        uiMenuBackgroundColor: "#2A2A2A",
        uiMenuTitleBackgroundColor: "#404040",
        uiMenuSubBackgroundColor: "#363636",
        uiMenuSubBackground2Color: "#404040",
        uiButtonColor: "#444444",
        uiGameBackgroundColor: "#121212",
        uiGameBorderColor: "#ff0000",
        uiLeaderboardHighlightSelf: "#ffaaaa",
        uiLeaderboardHighlightParty: "#aaffaa",
        uiPartyLeaderColor: "#00ffff",
        uiGameColorSuccess: "#00ff00",
        uiGameColorWarning: "#ffff00",
        uiGameColorError: "#ff0000",
        uiPartnerHighlightColor: "#00FF00",
        // Default highlight color (Green)
        // ... other theme settings
        _FoodColors: [],
        aCustomBackground: "",
        aCustomSpike: "",
        aCustomMother: "",
        rBorderSize: 32,
        rBackgroundOpacity: 1,
        sBackgroundScalingMode: "cover"
        // Options: 'cover', 'contain', 'stretch'
    }

    // Create a copy of the default theme
    const defaultUiTheme = {}
    for (var themeKey in uiTheme) {
        defaultUiTheme[themeKey] = uiTheme[themeKey]
    }

    // Game settings
    var isThemeEnabled = false
    const customAssets = {
        aCustomBackground: null,
        aCustomSpike: null,
        aCustomMother: null
    }
    var backgroundSprite = null
    // PIXI sprite for custom background

    // List of CORS proxies to try when loading external images
    const corsProxies = ["https://corsproxy.io/?", "https://cors-anywhere.herokuapp.com/", "https://api.allorigins.win/raw?url="]
    let currentCorsProxyIndex = 0
    // Track which proxy to use next

    /**
     * Apply CORS proxy to a URL if it's not from the same domain
     * @param {string} url - The original URL
     * @returns {string} - URL with CORS proxy if needed
     */
    function applyCorsProxy(url) {
        // Don't apply proxy to data URLs or same-domain URLs
        if (!url || url.startsWith("data:") || url.includes("gota.io")) {
            return url
        }

        // Try to use the current proxy
        const proxy = corsProxies[currentCorsProxyIndex]

        // Rotate to the next proxy for the next request (load balancing)
        currentCorsProxyIndex = (currentCorsProxyIndex + 1) % corsProxies.length

        // Return the proxied URL
        return proxy + encodeURIComponent(url)
    }

    // Game textures
    var spikeTexture = null
    // Texture for spike cells
    var motherCellTexture = null
    // Texture for mother cells
    var happyMotherCellTexture = null
    // Texture for happy mother cells (event-related)

    // Skin loading status and texture cache
    var skinLoadingStatus = {}
    var skinTextureCache = {}
    var subPanelSettings = {
        rules: false,
        nameColor: {
            r: 0,
            g: 255,
            b: 255
        },
        chatColor: 0,
        lowerName: false,
        skinName: "",
        effect: 0,
        nameFont: 0
    }

    // Server list management
    var serverListInterval = null
    var currentServerList = null
    var listRefreshTimestamp = 0

    // Mouse movement threshold for optimization
    const MOUSE_MOVE_THRESHOLD_SQ = 5 * 5
    // Only send if mouse moved > 5px (squared)

    // Store original WebSocket for potential modifications

    // --- Enhanced Linesplit Configuration ---
    const AXIS_LOCK_THRESHOLD = clientSettings.rLinesplitThreshold || 15
    // Pixels in game coords mouse must move to lock axis - now configurable
    const LINESPLIT_LINEUP_DELAY_MS = 100
    // Milliseconds delay for lineup
    let lastMouseSendCoords = {
        x: -Infinity,
        y: -Infinity
    }
    // Replaces lastSentMouseX/Y

    const lineSplitHelper = {
        pendingSplitCount: 0,
        linesplitState: "idle",
        // 'idle', 'activating', 'locking', 'active-x', 'active-y'
        linesplitActivationTime: 0,
        linesplitLineupComplete: false,
        linesplitPacketTimer: null,
        linesplitMouseFreezeBackup: false,
        // Visual indicator properties
        trajectoryLine: null,
        stateIndicator: null,
        axisIndicator: null,

        // Initialize visual elements for linesplit
        initVisualElements: function() {
            // Create trajectory line if it doesn't exist
            if (!this.trajectoryLine && PIXI) {
                this.trajectoryLine = new PIXI.Graphics();
                this.trajectoryLine.visible = false;
                markerContainer.addChild(this.trajectoryLine);

                // Create state indicator (circle at anchor point)
                this.stateIndicator = new PIXI.Graphics();
                this.stateIndicator.visible = false;
                markerContainer.addChild(this.stateIndicator);

                // Create axis indicator (text showing X or Y)
                this.axisIndicator = new PIXI.Text("", {
                    fontFamily: "Arial",
                    fontSize: 16,
                    fill: 0xFFFFFF,
                    align: "center",
                    stroke: 0x000000,
                    strokeThickness: 4
                });
                this.axisIndicator.visible = false;
                this.axisIndicator.anchor.set(0.5);
                markerContainer.addChild(this.axisIndicator);
            }
        },

        // Method called on keydown for kLinesplit
        activateLinesplitToggle: function () {
            const activePlayer = getActivePlayer()
            if (!activePlayer || Object.keys(activePlayer.myCells).length === 0) {
                console.warn("[Linesplit] Activation attempt failed: No active player or no cells.")
                return
            }

            // Initialize visual elements if needed
            this.initVisualElements();

            if (clientSettings.sLinesplitMode === "TOGGLE") {
                if (this.linesplitState === "idle") {
                    this.startLinesplitActivation(activePlayer)
                } else {
                    this.stopLinesplit(activePlayer)
                }
            } else {
                // HOLD mode
                this.startLinesplitActivation(activePlayer)
            }
        },

        // Method called on keyup for kLinesplit
        deactivateLinesplitHold: function () {
            const activePlayer = getActivePlayer()
            if (clientSettings.sLinesplitMode === "HOLD" && this.linesplitState !== "idle") {
                this.stopLinesplit(activePlayer)
            }
        },

        // Check if split keypress should be handled by helper
        canSplitNow: function (splitCount = 1) {
            if (this.linesplitState === "activating" || this.linesplitState === "locking") {
                this.pendingSplitCount += splitCount
                console.log(`[Linesplit] Queued ${splitCount} splits during ${this.linesplitState}. Total pending: ${this.pendingSplitCount}`)
                return true
                // Keypress consumed, splits queued
            } else if (this.linesplitState.startsWith("active-")) {
                console.log(`[Linesplit] Active, sending ${splitCount} splits immediately.`)
                const activePlayer = getActivePlayer()
                // Get active player to send command
                if (activePlayer && typeof activePlayer.sendSplit === "function") {
                    activePlayer.sendSplit(splitCount)
                } else {
                    console.error("[Linesplit] Cannot send splits, active player or sendSplit method not found.")
                }
                return true
                // Keypress consumed, splits sent
            }
            return false
            // Linesplit idle, allow normal split logic in handleKey
        },

        startLinesplitActivation: function (activePlayer) {
            if (this.linesplitState !== "idle") return

            this.linesplitActivationTime = Date.now()
            this.linesplitLineupComplete = false
            this.linesplitPacketTimer = null
            this.pendingSplitCount = 0

            let anchorFound = false
            // Use player's 'myCells' property, assuming it holds cell objects with 'size', 'x', 'y'
            const myCellsMap = activePlayer.myCells
            const cellCount = Object.keys(myCellsMap).length

            if (cellCount > 0) {
                let biggestCell = {
                    size: -1
                }
                for (const cellId in myCellsMap) {
                    const currentCell = myCellsMap[cellId]
                    // Use INTERPOLATED size ('size') for comparison
                    if (currentCell.size > biggestCell.size) {
                        biggestCell = currentCell
                    }
                }
                if (biggestCell.size >= 0) {
                    // --- CHANGE TO USE x_ / y_ ---
                    activePlayer.lineSplitAnchorX = biggestCell.x_
                    // Use TARGET position x_
                    activePlayer.lineSplitAnchorY = biggestCell.y_
                    // Use TARGET position y_
                    // --- END CHANGE ---
                    anchorFound = true
                    console.log("[Linesplit Activate] Anchor SET to biggest cell TARGET pos:", activePlayer.lineSplitAnchorX.toFixed(0), activePlayer.lineSplitAnchorY.toFixed(0))
                }
            }

            if (!anchorFound) {
                // Fallback if no cells found (should check cellCount earlier)
                activePlayer.lineSplitAnchorX = activePlayer.centerX
                // Use interpolated camera center
                activePlayer.lineSplitAnchorY = activePlayer.centerY
                console.log("[Linesplit Activate] Anchor SET to player center (fallback):", activePlayer.lineSplitAnchorX.toFixed(0), activePlayer.lineSplitAnchorY.toFixed(0))
                if (cellCount === 0) {
                    console.log("[Linesplit Activate] No cells, activation aborted.")
                    return
                    // Don't activate
                }
            }

            this.linesplitState = "activating"
            activePlayer.lineSplitAxis = null

            this.linesplitMouseFreezeBackup = activePlayer.mouseFrozen

            // Show visual indicators
            if (this.stateIndicator) {
                this.stateIndicator.clear();
                this.stateIndicator.beginFill(0x00FFFF, 0.5);
                this.stateIndicator.drawCircle(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY, 20);
                this.stateIndicator.endFill();
                this.stateIndicator.visible = true;
            }

            // Show HUD notification
            YF(true, "Linesplit: Activating");
            showLinesplitNotification("Linesplit: Activating", "#00FFFF");

            console.log(`[Linesplit] State -> activating. Anchor: (${activePlayer.lineSplitAnchorX.toFixed(0)}, ${activePlayer.lineSplitAnchorY.toFixed(0)})`)

            clearTimeout(this.linesplitPacketTimer)
            // Clear previous timer just in case
            this.linesplitPacketTimer = setTimeout(() => {
                if (this.linesplitState === "activating") {
                    console.log(`[Linesplit] Lineup delay complete. Sending ${this.pendingSplitCount} queued splits.`)
                    if (this.pendingSplitCount > 0) {
                        if (activePlayer && typeof activePlayer.sendSplit === "function") {
                            activePlayer.sendSplit(this.pendingSplitCount)
                        }
                        this.pendingSplitCount = 0
                    }
                    this.linesplitLineupComplete = true
                    this.linesplitState = "locking"
                    console.log("[Linesplit] State -> locking (waiting for axis).")

                    // Update HUD notification
                    YF(true, "Linesplit: Locking Axis");
                    showLinesplitNotification("Linesplit: Locking Axis", "#FFFF00");

                    // Update visual indicator
                    if (this.stateIndicator) {
                        this.stateIndicator.clear();
                        this.stateIndicator.beginFill(0xFFFF00, 0.5);
                        this.stateIndicator.drawCircle(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY, 20);
                        this.stateIndicator.endFill();
                    }
                }
            }, LINESPLIT_LINEUP_DELAY_MS)
        },

        stopLinesplit: function (activePlayer) {
            // Pass activePlayer if needed for freeze logic
            if (this.linesplitState === "idle") return
            const wasActiveOrLocking = this.linesplitState !== "activating"

            clearTimeout(this.linesplitPacketTimer)
            this.linesplitPacketTimer = null
            this.linesplitState = "idle"
            if (activePlayer) activePlayer.lineSplitAxis = null
            this.pendingSplitCount = 0

            // Hide visual indicators
            if (this.trajectoryLine) this.trajectoryLine.visible = false;
            if (this.stateIndicator) this.stateIndicator.visible = false;
            if (this.axisIndicator) this.axisIndicator.visible = false;

            // Update HUD
            YF(false, "Linesplit: Off");
            showLinesplitNotification("Linesplit: Deactivated", "#FF5555");

            console.log(`[Linesplit] State -> idle (${wasActiveOrLocking ? "was active/locking" : "activation cancelled"})`)
        },

        updateInGameLoop: function (activePlayer, mouseGameX, mouseGameY) {
            if (this.linesplitState === "idle" || !activePlayer) {
                // Hide visual indicators when idle
                if (this.trajectoryLine) this.trajectoryLine.visible = false;
                if (this.stateIndicator) this.stateIndicator.visible = false;
                if (this.axisIndicator) this.axisIndicator.visible = false;
                return [mouseGameX, mouseGameY];
            }

            let finalTargetX = mouseGameX
            let finalTargetY = mouseGameY
            const cellCount = Object.keys(activePlayer.myCells).length

            if (cellCount === 0) {
                this.stopLinesplit(activePlayer)
                console.log("[Loop Frame] Linesplit disabled - no cells detected.")
                return [mouseGameX, mouseGameY]
            }

            if (this.linesplitState === "activating") {
                finalTargetX = activePlayer.lineSplitAnchorX
                finalTargetY = activePlayer.lineSplitAnchorY

                // Update trajectory line (not visible during activation)
                if (this.trajectoryLine) this.trajectoryLine.visible = false;

            } else if (this.linesplitState === "locking") {
                const deltaX = Math.abs(mouseGameX - activePlayer.lineSplitAnchorX)
                const deltaY = Math.abs(mouseGameY - activePlayer.lineSplitAnchorY)

                // Show trajectory preview based on current mouse position
                if (this.trajectoryLine) {
                    this.trajectoryLine.clear();
                    this.trajectoryLine.lineStyle(3, 0xFFFF00, 0.7);

                    if (deltaX > deltaY) {
                        // Horizontal line preview
                        this.trajectoryLine.moveTo(activePlayer.lineSplitAnchorX - 2000, activePlayer.lineSplitAnchorY);
                        this.trajectoryLine.lineTo(activePlayer.lineSplitAnchorX + 2000, activePlayer.lineSplitAnchorY);
                    } else {
                        // Vertical line preview
                        this.trajectoryLine.moveTo(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY - 2000);
                        this.trajectoryLine.lineTo(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY + 2000);
                    }
                    this.trajectoryLine.visible = true;
                }

                if (deltaX > AXIS_LOCK_THRESHOLD || deltaY > AXIS_LOCK_THRESHOLD) {
                    activePlayer.lineSplitAxis = deltaX > deltaY ? "x" : "y"
                    this.linesplitState = `active-${activePlayer.lineSplitAxis}`
                    console.log(`[Loop Frame] ---> Axis lock threshold MET. State -> ${this.linesplitState}`)

                    // Update HUD
                    YF(true, `Linesplit: ${activePlayer.lineSplitAxis.toUpperCase()}-Axis`);
                    showLinesplitNotification(`Linesplit: ${activePlayer.lineSplitAxis.toUpperCase()}-Axis Locked`, "#00FF00");

                    // Update visual indicators
                    if (this.stateIndicator) {
                        this.stateIndicator.clear();
                        this.stateIndicator.beginFill(0x00FF00, 0.5);
                        this.stateIndicator.drawCircle(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY, 20);
                        this.stateIndicator.endFill();
                    }

                    if (this.axisIndicator) {
                        this.axisIndicator.text = activePlayer.lineSplitAxis.toUpperCase();
                        this.axisIndicator.position.set(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY - 40);
                        this.axisIndicator.visible = true;
                    }

                    if (this.trajectoryLine) {
                        this.trajectoryLine.clear();
                        this.trajectoryLine.lineStyle(3, 0x00FF00, 0.7);

                        if (activePlayer.lineSplitAxis === "x") {
                            // Horizontal line
                            this.trajectoryLine.moveTo(activePlayer.lineSplitAnchorX - 2000, activePlayer.lineSplitAnchorY);
                            this.trajectoryLine.lineTo(activePlayer.lineSplitAnchorX + 2000, activePlayer.lineSplitAnchorY);
                            finalTargetY = activePlayer.lineSplitAnchorY;
                        } else {
                            // Vertical line
                            this.trajectoryLine.moveTo(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY - 2000);
                            this.trajectoryLine.lineTo(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY + 2000);
                            finalTargetX = activePlayer.lineSplitAnchorX;
                        }
                    }
                } else {
                    finalTargetX = activePlayer.lineSplitAnchorX
                    finalTargetY = activePlayer.lineSplitAnchorY
                }
            } else {
                // 'active-x' or 'active-y'
                if (activePlayer.lineSplitAxis === "x") {
                    finalTargetY = activePlayer.lineSplitAnchorY;

                    // Update trajectory line for X-axis movement
                    if (this.trajectoryLine) {
                        this.trajectoryLine.clear();
                        this.trajectoryLine.lineStyle(3, 0x00FF00, 0.7);
                        this.trajectoryLine.moveTo(activePlayer.lineSplitAnchorX - 2000, activePlayer.lineSplitAnchorY);
                        this.trajectoryLine.lineTo(activePlayer.lineSplitAnchorX + 2000, activePlayer.lineSplitAnchorY);
                        this.trajectoryLine.visible = true;
                    }
                } else if (activePlayer.lineSplitAxis === "y") {
                    finalTargetX = activePlayer.lineSplitAnchorX;

                    // Update trajectory line for Y-axis movement
                    if (this.trajectoryLine) {
                        this.trajectoryLine.clear();
                        this.trajectoryLine.lineStyle(3, 0x00FF00, 0.7);
                        this.trajectoryLine.moveTo(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY - 2000);
                        this.trajectoryLine.lineTo(activePlayer.lineSplitAnchorX, activePlayer.lineSplitAnchorY + 2000);
                        this.trajectoryLine.visible = true;
                    }
                }
            }
            return [finalTargetX, finalTargetY]
        },

        handleSettingsUpdate: function (newModeValue) {
            this.stopLinesplit(getActivePlayer())
            // Stop with current active player
            console.log(`[Linesplit] Mode setting changed to ${newModeValue}. State reset.`)
        },

        handlePlayerDeathOrDisconnect: function () {
            if (this.linesplitState !== "idle") {
                this.stopLinesplit(null)
                // Stop without specific player instance if unknown
                console.log("[Linesplit] State reset due to death/disconnect.")
            }
        }
    }

    /**
     * Adds a "Dual Keybinds" header row to the hotkeys table.
     * @returns {boolean} - True if successful, false otherwise.
     */
    function addDualKeybindsHeader(name) {
        const container = document.querySelector(".dual-hotkeys-table")
        if (!container) return false

        const existingHeader = Array.from(container.children).find((el) => el.classList?.contains("section-title") && el.textContent === name)
        if (existingHeader) return true

        const header = document.createElement("div")
        header.className = "section-title"
        header.textContent = name
        container.appendChild(header)

        return true
    }

    /**
     * Adds a custom keybind row specifically to the end of the hotkeys table body.
     * Assumes the header row might already be added.
     * @param {string} actionName - The descriptive name of the keybind action.
     * @param {string} keybindID - The unique ID for the button element (e.g., 'kMyCustomBind').
     */

    function setupChoiceButtons(containerId, storageKey, options) {
        const choiceGroup = document.getElementById(containerId)
        // First, clear any existing content in the container
        choiceGroup.innerHTML = ""
        clientSettings[storageKey]=localStorage.getItem(storageKey);
        // 1. Create the .dual-choice-group element
        //const choiceGroup = document.createElement('div');
        //choiceGroup.className = 'dual-choice-group';

        options.forEach(({ value, label }) => {
            const btn = document.createElement("button")
            btn.className = `button dual-choice-btn ${localStorage.getItem(storageKey) === value ? "primary-button" : "secondary-button"}`
            btn.innerHTML = `${label}`

            btn.addEventListener("click", () => {
                // Deactivate all buttons within *this* choice group
                choiceGroup.querySelectorAll(".dual-choice-btn").forEach((b) => {
                    b.classList.add("secondary-button")
                    b.classList.remove("primary-button")
                })
                btn.classList.remove("secondary-button")
                btn.classList.add("primary-button")
                localStorage.setItem(storageKey, value)
                clientSettings[storageKey]=value;
            })

            choiceGroup.appendChild(btn)
            // Append button to the choice group
        })
        // 2. Append the .dual-choice-group element to the container
    }
    setupChoiceButtons("dualCameraModeGroup", "sCameraMode", [
        {
            value: "default",
            label: "Default"
        },
        {
            value: "mass",
            label: "Mass Weighted"
        },
        {
            value: "ultrasmooth",
            label: "Ultra Smooth"
        }
    ])

    function addDualKeybindRow(actionName, keybindID, comment) {
        const container = document.querySelector(".dual-hotkeys-table")
        if (!container || document.getElementById(keybindID)) return

        const row = document.createElement("div")
        if (comment) {
            row.innerHTML = `
            <span data-balloon="${comment}" data-balloon-pos="up" data-balloon-length="fit">${actionName}</span>
            <button id="${keybindID}" class="keybinds-btn">&nbsp;</button>
          `
        } else {
            row.innerHTML = `
            <span>${actionName}</span>
            <button id="${keybindID}" class="keybinds-btn">&nbsp;</button>
          `
        }
        row.className = "keybind-row"

        container.appendChild(row)
    }

    function setupDualKeybindsSection() {
        console.log("Setting up Dual Keybinds section...")
        // First, attempt to add the header row
        const headerAdded = addDualKeybindsHeader("Control Hotkeys")

        // Only add rows if the header was successfully added (or already existed)
        if (headerAdded) {
            // --- Add your custom dual keybind rows here ---
            // Example calls (replace with your actual keybind names and IDs):

            var controlKeyBinds = [
                ["Switch Player", "kSwitchTab", 'Switch Controlling Player'], //name, variable, icon name
                ["Camera Mode", "kBiggestCellMode", 'Change the Calculation Method for Viewpoint'],
                ["Fast Feed", "kFastFeed"],
                ["Fast Feed Mode", "kFastFeedMode"],
                ["Dual Mode", "kDualMode", 'Enable/Disable Dual Camera Mode'], //name, variable, icon name
                ["Mouse Follow", "kMouseFollow", 'Make Non-active Player Follows the Cursor']
            ]

            console.log("Adding dual keybind rows from array...")
            // --- Loop through the array and add rows ---
            controlKeyBinds.forEach((keybind) => {
                if (Array.isArray(keybind) && keybind.length >= 2) {
                    const actionName = keybind[0]
                    const keybindID = keybind[1]
                    const comment = keybind[2];
                    addDualKeybindRow(actionName, keybindID, comment)
                } else {
                    console.warn("Skipping invalid keybind entry in customKeyBinds array:", keybind)
                }
            })

            addDualKeybindsHeader("Macro Hotkeys")

            var macroKeyBinds = [
                ["LineSplit", "kLineSplit", 'Enable Orthogonal Linesplits'],
                ["TrickSplit", "kTrickSplit", 'Standard Tricksplit, Smaller one Always Split Once'],
                ["InfernoSplit", "kInfernoSplit", 'Allows 2 Player to Split at the Same Time, the Controlling one doubles'],
                ["Fix Cell Location", "kFixCellLocation", 'Hold for Alternating Parallel Moving'],
                ["Solotrick Mothership", "kSoloMs", "animation"],
                ["Solotrick", "kSoloTrick", "animation"],
                ["32x Split", "k32xSplit", "animation"],
                ["128x Split", "k128xSplit", "animation"],
                ["256x Split", "k256xSplit", "animation"],
                ["Multibox OneSplit", "kMultiSplit", 'Make the Non-active Player Split Once'],
                ["Multibox DoubleSplit", "kMultiDouble", 'Make the Non-active Player Split Twice'],
                ["Multibox MaxSplit", "kMultiMax", 'Make the Non-active Player Max Split'],
                ["Multibox Eject", "kMultiEject", 'Make the Non-active Player Eject Food']
                //   ["Auto Reverse 1X", "kAutoReverse1X"],
                //   ["Auto Reverse 4X", "kAutoReverse2X"]
            ]

            // --- Loop through the array and add rows ---
            macroKeyBinds.forEach((keybind) => {
                // Ensure the inner array has the expected structure [actionName, keybindID]
                if (Array.isArray(keybind) && keybind.length >= 2) {
                    const actionName = keybind[0]
                    const keybindID = keybind[1]
                    const comment = keybind[2];
                    addDualKeybindRow(actionName, keybindID, comment)
                } else {
                    console.warn("Skipping invalid keybind entry in customKeyBinds array:", keybind)
                }
            })

            addDualKeybindsHeader("Info Hotkeys")

            var infoKeyBinds = [
                ["Toggle Threat Indicators", "kToggleThreatIndicators"],
                ["Toggle Show Mass", "kToggleShowMass"],
                ["Toggle Show Names", "kToggleShowNames"],
                ["Toggle Show Skins", "kToggleHideSkins"],
                ["Toggle Show Chat", "kToggleHideChat"],
                ['Mark Denger', 'kMarkDenger'],
                ['Mark Food', 'kMarkFood'],
                ['Mark Direction', 'kMarkDirection']
            ]

            // --- Loop through the array and add rows ---
            infoKeyBinds.forEach((keybind) => {
                // Ensure the inner array has the expected structure [actionName, keybindID]
                if (Array.isArray(keybind) && keybind.length >= 2) {
                    const actionName = keybind[0]
                    const keybindID = keybind[1]
                    addDualKeybindRow(actionName, keybindID)
                } else {
                    console.warn("Skipping invalid keybind entry in customKeyBinds array:", keybind)
                }
            })

            // After adding rows, you might need to update the button text
            // based on loaded settings, e.g.:
            // updateAllKeybindButtonDisplays();
        }
    }

    // Create a container div (Du) to hold both score panels
    var Du = document.createElement("div")
    Du.style.display = "flex"
    Du.style.gap = "10px"
    Du.style.alignItems = "start"

    // Find the original score panel inside the HUD
    const scorePanell = document.querySelector("#score-panel")

    $(document).ready(function () {
        document.addEventListener("DOMContentLoaded", function () {
            const profiles = document.querySelectorAll(".account-nav-item")
            const pages = document.querySelectorAll(".account-tab-content")

            profiles.addEventListener("click", function (e) {
                pages.forEach((section) => {
                    section.style.display = "none"
                    section.classList.remove("active")
                })
                profiles.forEach((btn) => {
                    btn.classList.remove("active")
                })
                const activeTab = document.querySelector(`[data-section="${e}"]`)
                const activeSection = document.getElementById(`${e}`)

                if (activeTab && activeSection) {
                    activeTab.classList.add("active")
                    activeSection.style.display = "block"
                    activeSection.classList.add("active")
                }
                console.log(e)
            })

            // ======================
            // 4. Hotkey Binding (Hotkeys Tab)
            // ======================
            function setupHotkeyButton(button, storageKey) {
                // Load saved hotkey or show default
                button.textContent = localStorage.getItem(storageKey) || "Press to Bind"

                button.addEventListener("click", function (e) {
                    e.stopPropagation()
                    if (button.classList.contains("listening")) return

                    button.textContent = "Press any key..."
                    button.classList.add("listening")

                    const handleKeyPress = function (e) {
                        e.preventDefault()
                        const key = e.key.toUpperCase()

                        // Don't allow modifier keys alone
                        if (["CONTROL", "SHIFT", "ALT", "META"].includes(key)) return

                        button.textContent = key
                        button.classList.remove("listening")
                        localStorage.setItem(storageKey, key)
                        document.removeEventListener("keydown", handleKeyPress)
                    }

                    document.addEventListener("keydown", handleKeyPress)
                })
            }

            // Initialize hotkey buttons
            setupHotkeyButton(document.getElementById("kSwitchPlayer"), "dualSwitchPlayerHotkey")
            setupHotkeyButton(document.getElementById("kFastFeed"), "dualFastFeedHotkey")

            // ======================
            // 5. Settings (Options Tab)
            // ======================
            // Camera Mode  (REMOVED SELECT ELEMENT LOGIC)

            // Fast Feed Mode (Only setting needed) (REMOVED SELECT ELEMENT LOGIC)

            // ======================
            // 7. Choice Button handling (REPLACES SELECT ELEMENT LOGIC)
            // ======================
        })
    })

    function YF(FM, Fn) {
        var Ff = document.getElementById("hud-autoRev")
        var Fb = document.getElementById("hud-target")
        if (Ff) {
            Fb.textContent = Fn
            if (FM) {
                Ff.textContent = "On"
                Ff.style.color = "green"
            } else {
                Ff.textContent = "Off"
                Ff.style.color = "red"
            }
        }
    }

    /**
     * Shows a notification for linesplit status changes
     * @param {string} message - The message to display in the notification
     * @param {string} color - The color of the notification (default: green)
     */
    function showLinesplitNotification(message, color = "#00FF00") {
        // Create notification container if it doesn't exist
        if (!$("#linesplit-notification").length) {
            $('<div id="linesplit-notification" style="position: fixed; top: 120px; left: 50%; transform: translateX(-50%); z-index: 1000;"></div>').appendTo(document.body);
        }

        // Clear any existing notifications
        $("#linesplit-notification").empty();

        // Create and style the notification
        var notification = $('<div class="linesplit-alert">' + message + "</div>");
        notification.css({
            "background-color": "rgba(0, 0, 0, 0.8)",
            "color": color,
            "padding": "10px 15px",
            "border-radius": "5px",
            "font-family": "Arial, sans-serif",
            "font-size": "14px",
            "font-weight": "bold",
            "text-align": "center",
            "box-shadow": "0 0 10px rgba(0, 0, 0, 0.5)",
            "border": "1px solid rgba(255, 255, 255, 0.3)",
            "margin-bottom": "10px",
            "opacity": "0",
            "transition": "opacity 0.3s ease-in-out"
        });

        // Add to the notification container
        $("#linesplit-notification").append(notification);

        // Animation sequence: fade in, wait, fade out, remove
        setTimeout(function() {
            notification.css("opacity", "1");

            setTimeout(function() {
                notification.css("opacity", "0");

                setTimeout(function() {
                    notification.remove();
                }, 300); // Remove after fade out completes
            }, 2000); // Show for 2 seconds
        }, 10); // Small delay before starting fade in
    }

    /**
     * Ensures the "Invite Player 2" button exists, attaches its click listener (only once),
     * positions it top-middle, and updates its visibility based on current game state.
     */
    function manageInvitePlayer2Button() {
        // Ensure jQuery is loaded before proceeding
        if (typeof window.jQuery === "undefined") {
            console.error("jQuery ($) is not available yet for manageInvitePlayer2Button.")
            return
        }
        const $ = window.jQuery
        // Assign to local $

        const buttonId = "btn-invite-player2-top"
        // Changed ID slightly for clarity
        const buttonSelector = "#" + buttonId
        let inviteButton = $(buttonSelector)

        // --- Determine Button Visibility Conditions ---
        const p1Ready = typeof player1 !== "undefined" && player1 && typeof player1.isConnected === "function" && player1.isConnected() && typeof player1.playerId !== "undefined" && player1.playerId !== 0 && typeof player1.partyIds !== "undefined"

        const p2Ready = typeof player2 !== "undefined" && player2 && typeof player2.isConnected === "function" && player2.isConnected() && typeof player2.playerId !== "undefined" && player2.playerId !== 0

        const p2NotInParty = p1Ready && p2Ready && player1.partyIds && player2.playerId != null && !player1.partyIds.hasOwnProperty(player2.playerId)

        const shouldShowButton = p1Ready && p2Ready && p2NotInParty
        // --- End Conditions ---

        //BOT INVITATION NOTIFICATION
        //flag not working

        const isNotificationClicked = localStorage.getItem("notificationClicked") === "true"

        if (shouldShowButton && !isNotificationClicked) {
            let inviteButton = $("#" + buttonId)
            if (inviteButton.length === 0) {
                const freshNotificationStyles = {
                    "position": "fixed",
                    "right": "20px",
                    "top": "50%",
                    "transform": "translateY(-50%)",
                    "z-index": "1000",
                    "display": "flex",
                    "align-items": "center",
                    "background": "linear-gradient(135deg, rgba(155, 63, 241, 0.7), rgba(102, 64, 114, 0.7))",
                    "color": "#d3d3d3",
                    "padding": "14px 22px",
                    "border-radius": "12px",
                    "box-shadow": "0 6px 12px rgba(0, 0, 0, 0.3)",
                    "cursor": "pointer",
                    "font-family": '"Inter", sans-serif',
                    "font-size": "14px",
                    "font-weight": "500",
                    "gap": "10px",
                    "animation": "slideIn 0.3s ease-out",
                    "transition": "transform 0.2s ease",
                    "backdrop-filter": "blur(8px)",
                    "-webkit-backdrop-filter": "blur(8px)",
                    "border": "1px solid rgba(255, 255, 255, 0.1)"
                }

                inviteButton = $("<div>")
                    .attr("id", buttonId)
                    .addClass("notification-invite")
                    .css(freshNotificationStyles)
                    .hover(
                        function () {
                            $(this).css("transform", "translateY(-50%) scale(1.03)")
                        },
                        function () {
                            $(this).css("transform", "translateY(-50%) scale(1)")
                        }
                    )
                    .on("click", function () {
                        localStorage.setItem("notificationClicked", "true")
                        $(this).fadeOut(300, function () {
                            $(this).remove()
                        })
                    })

                const icon = $("<i>").addClass("fas fa-check-circle").css({
                    "font-size": "16px",
                    "color": "#b0b0b0"
                })

                const text = $("<span>").text("Bot Ready! Click here to invite.")

                inviteButton.append(icon).append(text)
                $("body").append(inviteButton)
                $("<style>")
                    .text(
                        `
                              @keyframes slideIn {
                                  from { transform: translateX(100%) translateY(-50%); opacity: 0; }
                                  to { transform: translateX(0) translateY(-50%); opacity: 1; }
                              }
                          `
                    )
                    .appendTo("head")

                // END BOT NOTIFY

                // --- Attach click listener ONLY ONCE during creation ---
                inviteButton.off("click").on("click", function (e) {
                    e.stopPropagation()

                    // Re-check conditions on click
                    const p1CanSend = typeof player1 !== "undefined" && player1 && player1.isConnected() && player1.playerId !== 0
                    const p2ExistsWithId = typeof player2 !== "undefined" && player2 && player2.playerId !== 0
                    const p2CurrentlyNotInParty = p1CanSend && player1.partyIds && !player1.partyIds.hasOwnProperty(player2?.playerId)

                    if (p1CanSend && p2ExistsWithId && p2CurrentlyNotInParty) {
                        console.log(`Invite P2 button click action: P1 (${player1.playerId}) inviting P2 (${player2.playerId}).`)
                        try {
                            player1.sendPacket(new network.sendPartyAction(0, player2.playerId))
                            player1.selfMsg(`Sent party invite to Player 2 (ID: ${player2.playerId}).`)
                        } catch (sendError) {
                            console.error("Error sending party invite packet:", sendError)
                            player1.selfMsg("Error sending invite.")
                        }
                        $(this).hide()
                        // Hide after attempt
                    } else {
                        console.warn("Invite P2 click ignored: Conditions changed or failed check.")
                        $(this).hide()
                    }
                    $(this).blur()
                })
                console.log(`'${buttonId}' click handler attached.`)
            }
            // --- End Creation ---

            // --- Ensure button is visible ---
            // console.log("Showing Invite P2 button."); // Uncomment for debug
            inviteButton.show()
        } else {
            // Conditions NOT met
            // --- Hide Button if it exists ---
            if (inviteButton.length > 0) {
                // console.log("Hiding Invite P2 button."); // Uncomment for debug
                inviteButton.hide()
            }
        }
    }
    /**
     * Initialize UI elements by getting references to DOM elements
     */

    var profiles = null
    var pages = null

    var test1 = null

    function checkForThis() { }

    function initializeUIElements() {
        if (typeof test1 == "undefined") {
            return
        }

        if (typeof checkForThis !== "function") {
            return
        }
        canvas = document.getElementById("canvas")
        minimap_canvas = document.getElementById("minimap-canvas")
        minimapContext = minimap_canvas.getContext("2d")
        contextMenuElem = $("#context-menu")
        mainUI = $("#main")
        partyPanel = $("#party-panel")
        hudPanel = $(".hud-panel")
        scorePanel = document.getElementById("score-panel")
        scorePanel2 = document.getElementById("score-panel2")
        scorePanelTwo = document.getElementById("score-panel2")
        scorePanelContainer = document.getElementById("score-panels")
        scrimmageMenu = $("#main-scrimmage")
        contextMenu = $("#context-menu")
        chatContainer = document.getElementById("chat-container")
        chatInput = document.getElementById("chat-input")
        leaderboardHeader = $("#leaderboard-header")
        scrimmageCustom = $("#scrimmage-custom")
        sections = document.querySelectorAll(".dual-settings-section")
        profiles = document.querySelectorAll(".account-nav-item")
        pages = document.querySelectorAll(".account-tab-content")
        hudElements.mouseFrozenDiv2 = document.getElementById("p2Mouse")
        hudElements.playerScore2 = document.getElementById("p2Score").querySelector("span")
        hudElements.playerMass2 = document.getElementById("p2Mass").querySelector("span")
        hudElements.playerCells2 = document.getElementById("p2Cells").querySelector("span")
        hudElements.playerFps2 = document.getElementById("p2Fps").querySelector("span")

        hudElements.mouseFrozenDiv = document.getElementById("pMouse")
        hudElements.playerScore = document.getElementById("pScore").querySelector("span")
        hudElements.playerMass = document.getElementById("pMass").querySelector("span")
        hudElements.playerCells = document.getElementById("pCells").querySelector("span")
        hudElements.playerFps = document.getElementById("pFps").querySelector("span")
        hudElements.resetInfo = $("#extra-reset-timer")
        hudElements.resetTime = $("#resetTime")
        hudElements.respawnInfo = $("#extra-respawn-cooldown")
        hudElements.respawnCooldown = $("#respawnCooldown")
        hudElements.spectatorCount = $("#spectatorCount")
        hudElements.playerCellCount = 0
        hudElements.minimapCoords = $("#minimap-coordinates")
        hudElements.partyPanel = partyPanel
        hudElements.friendOnlineCount = $("#social-online-friends-count")
        _0x11B46()
        setupChoiceButtons('dualFastFeedTargetGroup', 'sFastFeed', [
            {
                value: 'MouseCursor',
                label: 'Mouse Cursor',
            },
            {
                value: 'BiggestCell',
                label: 'Biggest Friend',
            },
            {
                value: 'SmartTarget',
                label: 'Smart Target',
            },
        ])
        setupChoiceButtons('dualCosmeticTargetGroup', 'sCosmetic', [
            {
                value: 'None',
                label: 'None',
            },
            {
                value: 'Crown',
                label: 'Crown',
            },
            {
                value: 'Cat',
                label: 'Cat',
            },
        ])
        setupChoiceButtons('dualLinesplitTargetGroup', 'sLinesplitMode', [
            {
                value: 'TOGGLE',
                label: 'Toggle',
            },
            {
                value: 'HOLD',
                label: 'Hold',
            },
        ])

        // Add linesplit threshold slider
        const linesplitThresholdContainer = document.createElement('div');
        linesplitThresholdContainer.className = 'option-container';
        linesplitThresholdContainer.style.marginTop = '10px';

        const linesplitThresholdLabel = document.createElement('div');
        linesplitThresholdLabel.className = 'option-label';
        linesplitThresholdLabel.textContent = 'Axis Lock Threshold';
        linesplitThresholdContainer.appendChild(linesplitThresholdLabel);

        const linesplitThresholdGroup = document.createElement('div');
        linesplitThresholdGroup.className = 'dual-choice-group';

        const linesplitThresholdInput = document.createElement('input');
        linesplitThresholdInput.className = 'options-input';
        linesplitThresholdInput.id = 'linesplitThreshold';
        linesplitThresholdInput.style.float = 'none';
        linesplitThresholdInput.value = clientSettings.rLinesplitThreshold || 15;

        const linesplitThresholdSlider = document.createElement('input');
        linesplitThresholdSlider.type = 'range';
        linesplitThresholdSlider.id = 'rLinesplitThreshold';
        linesplitThresholdSlider.min = '5';
        linesplitThresholdSlider.max = '50';
        linesplitThresholdSlider.value = clientSettings.rLinesplitThreshold || 15;
        linesplitThresholdSlider.step = '1';

        // Connect the input and slider
        linesplitThresholdSlider.addEventListener('input', function() {
            linesplitThresholdInput.value = this.value;
            clientSettings.rLinesplitThreshold = parseInt(this.value);
            saveUserSettings();
        });

        linesplitThresholdInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            if (!isNaN(value) && value >= 5 && value <= 50) {
                linesplitThresholdSlider.value = value;
                clientSettings.rLinesplitThreshold = value;
                saveUserSettings();
            } else {
                this.value = linesplitThresholdSlider.value;
            }
        });

        linesplitThresholdGroup.appendChild(linesplitThresholdInput);
        linesplitThresholdGroup.appendChild(linesplitThresholdSlider);
        linesplitThresholdContainer.appendChild(linesplitThresholdGroup);

        // Add the threshold control to the linesplit settings section
        const linesplitTarget = document.getElementById('LinesplitTarget');
        if (linesplitTarget) {
            linesplitTarget.appendChild(linesplitThresholdContainer);
        }
        _0x12836 = false
        FastClick.attach(document.body)

        window.onmousemove = function (cli) {
            // Store the raw mouse position
            const rawX = cli.clientX;
            const rawY = cli.clientY;

            // Always update player1's mouse position directly
            player1.mouseRawX = rawX;
            player1.mouseRawY = rawY;

            // For both dual mode and non-dual mode, we use the same mouse position for both players
            // This is simpler and works better when both players are in the same view
            player2.mouseRawX = rawX;
            player2.mouseRawY = rawY;
        }
        window.onmousedown = function (mouse) {
            var key = mouse.button + 1
            if (isKeybindEditMode) {
                _0x112A6(key)
                mouse.preventDefault()
                return
            }
            if ($("input").is(":focus") || mainUI.css("display") != "none") {
                return
            }
            if (key == activeKeybinds.kSwitchTab) {
                mouse.preventDefault()
                Fbs()
            }

            if (key == activeKeybinds.kAutoReverse1X) {
                mouse.preventDefault()

                quickSplitEnabled = !quickSplitEnabled
                doubleSplitEnabled = !![]
                regularDoubleSplitEnabled = ![]
                tripleSplitEnabled = ![]
                quadrupleSplitEnabled = ![]
                sextupleSplitEnabled = ![]
            }

            if (key == activeKeybinds.kAutoReverse2X) {
                mouse.preventDefault()

                quickSplitEnabled = !quickSplitEnabled
                regularDoubleSplitEnabled = !![]
                doubleSplitEnabled = ![]
                tripleSplitEnabled = ![]
                quadrupleSplitEnabled = ![]
                sextupleSplitEnabled = ![]
            }

            if (key == activeKeybinds.kDiagLine) {
                mouse.preventDefault()
                let Nl = getActivePlayer()
                if (!Nl.mouseFrozen) {
                    Nl.mouseFrozen = !![]
                    for (let Nd = 0x0; Nd < 0x3; Nd++) {
                        Nl.sendPacket(new network.sendKey(0x11))
                    }
                    setTimeout(() => {
                        Nl.mouseFrozen = ![]
                    }, 0x4b0)
                }
            }

            if (key == activeKeybinds.kTrickSplit) {
                mouse.preventDefault()
                let cell1 = player1
                let cell2 = player2
                var M1 = 0
                var M2 = 0

                // Count cells and sum their masses
                for (var cellId in player1.myCells) M1 += player1.myCells[cellId].getRealMass()
                for (var cellId in player2.myCells) M2 += player2.myCells[cellId].getRealMass()

                const sizeFlag = M1 > M2
                for (let Nd = 0x0; Nd < 0x8; Nd++) {
                    setTimeout(() => {
                        ; (sizeFlag ? cell1 : cell2).sendPacket(new network.sendKey(0x11))
                    }, !!Nd * 200)
                }
                ; (sizeFlag ? cell2 : cell1).sendPacket(new network.sendKey(0x11))
            }
            console.log("Total Mass of Player 1 Cells:", M1)

            if (key == activeKeybinds.kSoloMs) {
                mouse.preventDefault()
                clientSettings.soloMothership = !clientSettings.soloMothership
            }

            if (key == activeKeybinds.kMouseFollow) {
                mouse.preventDefault()
                clientSettings.mouseFollow = !clientSettings.mouseFollow
            }

            if (key == activeKeybinds.kInfernoSplit) {
                mouse.preventDefault()
                let cell1 = player1
                let cell2 = player2
                const sizeFlag = getActivePlayer() == player1;

                for (let Nd = 0x0; Nd < 0x4; Nd++) {
                    setTimeout(() => {
                        ; (sizeFlag ? cell1 : cell2).sendPacket(new network.sendKey(0x11))
                    }, Nd * 20)
                }
                for (let Nd = 0x0; Nd < 0x2; Nd++) {
                    setTimeout(() => {
                        ; (sizeFlag ? cell2 : cell1).sendPacket(new network.sendKey(0x11))
                    }, Nd * 20)
                }
            }
            if (key == activeKeybinds.kFixCellLocation && !mousefix) {
                mouse.preventDefault()
                mousefix = 1
                macroIntervalID = setInterval(() => {
                    player1.sendPacket(new network.sendMouse(0xfffffff * macroIterations, 0))
                    player2.sendPacket(new network.sendMouse(0xfffffff * macroIterations, 0))
                    macroIterations *= -1
                }, 7)
            }

            ; (player1.enabled ? player1 : player2).handleKey(key)
        }
        window.onmouseup = function (mouse) {
            var key = mouse.button + 1
            if (key == keyMappings.kEjectMass) {
                _0x12836 = false
                if (player1) {
                    player1.sendPacket(new network.sendEjectMass(false))
                }
            }

            if (key == activeKeybinds.kSoloMs) {
                mouse.preventDefault()
                clientSettings.soloMothership = !clientSettings.soloMothership
            }

            // if (key == activeKeybinds.kMouseFollow) {
            //     mouse.preventDefault();
            //     clientSettings.mouseFollow = !clientSettings.mouseFollow;
            // }

            if (key == keyMappings.kFixCellLocation) {
                clearInterval(macroIntervalID)
                mousefix = 0
            }
        }
        window.onwheel = function (mouse) {
            if (mainUI.css("display") == "none" && mouse.target.id == "canvas") {
                var _0x111D7 = mouse.wheelDelta || mouse.deltaY * -1
                if (_0x111D7 > 0) {
                    player1.mouseZoom *= 1.1
                    player2.mouseZoom *= 1.1
                } else {
                    player1.mouseZoom *= 0.9
                    player2.mouseZoom *= 0.9
                }
                player1.mouseZoom =
                    player1.mouseZoom > 5 ? 5
                        : player1.mouseZoom < 0.1 ? 0.1
                            : player1.mouseZoom
                player2.mouseZoom =
                    player2.mouseZoom > 5 ? 5
                        : player2.mouseZoom < 0.1 ? 0.1
                            : player2.mouseZoom
            }
        }
        window.onkeydown = function (key) {
            var button = key.which || key.keyCode || key.charCode
            if (button <= 5) {
                return
            }
            if (isKeybindEditMode) {
                _0x112A6(button)
                key.preventDefault()
                return
            }
            if ($("input").is(":focus")) {
                return
            }
            if (button == 27) {
                showMainUI(mainUI)
                if (($("#popup-profile") || $("#popup-account-username").css("display") === "none").css("display") === "none") {
                    showGameUI($("#popup-profile"))
                    showGameUI($("#popup-account-username"))
                }
            }
            if (mainUI.css("display") != "none") {
                return
            }
            if (button == (activeKeybinds.kDoubleSplit || activeKeybinds.kSplit || activeKeybinds.kQuadSplit || activeKeybinds.kHexaSplit || activeKeybinds.kTripleSplit || activeKeybinds.kSwitchTab)) {
                hasSplit = true
            }

            if (button == activeKeybinds.kDualMode) {
                key.preventDefault()
                clientSettings.cDualMode = !clientSettings.cDualMode
                dualmodeGlobalCamX = -1
                dualmodeGlobalCamY = -1
                saveUserSettings()
                showFastFeedModeNotification("Dual Mode: " + (clientSettings.cDualMode ? "ON" : "OFF"))
            }

            if (button == activeKeybinds.kSoloTrick) {
                key.preventDefault();
                var player = getActivePlayer();
                if (!player) {
                    return;
                }
                const myCells = player.myCells;
                let totalMass = 0;
                for (const cellId in myCells) {
                    const obj = myCells[cellId];
                    const cellMass = obj.getRealMass();
                    totalMass += cellMass;
                }
                if (totalMass >= 1000) {
                    player.sendPacket(new network.sendEjectMass(true));
                    let splitCount = 12;
                    if (totalMass >= 35000) {
                        splitCount = 32;
                    } else {
                        if (totalMass >= 25000) {
                            splitCount = 24;
                        } else {
                            if (totalMass >= 10000) {
                                splitCount = 20;
                            } else {
                                if (totalMass >= 5000) {
                                    splitCount = 18;
                                } else {
                                    if (totalMass >= 2000) {
                                        splitCount = 16;
                                    }
                                }
                            }
                        }
                    }
                    for (let i = 0; i < splitCount; i++) {
                        player.sendPacket(new network.sendKey(17));
                    }
                    player.sendPacket(new network.sendEjectMass(true));
                    setTimeout(() => {
                        player.sendPacket(new network.sendEjectMass(false));
                    }, 300);
                }
            }

            if (button == activeKeybinds.kSwitchTab) {
                key.preventDefault()
                Fbs()
            }

            if (button == activeKeybinds.kFastFeed) {
                key.preventDefault()
                fastFeed()
            }

            if (button == activeKeybinds.kFastFeedMode) {
                key.preventDefault()
                cycleFastFeedMode()
            }

            if (button == activeKeybinds.kToggleThreatIndicators) {
                key.preventDefault()
                // Toggle the threat indicators setting
                clientSettings.cShowThreatIndicators = !clientSettings.cShowThreatIndicators
                // Save the settings
                saveUserSettings()
                // Show notification
                showFastFeedModeNotification("Threat Indicators: " + (clientSettings.cShowThreatIndicators ? "ON" : "OFF"))
            }

            if (button == activeKeybinds.kMarkDenger) {
                key.preventDefault();
                var member = getActivePlayer();
                const currentGameScale = member.scale;
                const mouseGameX = gameContainer.pivot.x - app.stage.position.x / currentGameScale + member.mouseRawX * 1 / currentGameScale;
                const mouseGameY = gameContainer.pivot.y - app.stage.position.y / currentGameScale + member.mouseRawY * 1 / currentGameScale;
                if (member) {
                    onScreenIcons.push({
                        icon: 'warning',
                        text: 'Denger',
                        x: mouseGameX,
                        y: mouseGameY,
                        party: false,
                        color: '#FF5F1F',
                        opacity: 1,
                        lasttime: Date.now() * 0.001
                    });
                }
            }
            if (button == activeKeybinds.kMarkDirection) {
                key.preventDefault();
                var member = getActivePlayer();
                const currentGameScale = member.scale;
                const mouseGameX = gameContainer.pivot.x - app.stage.position.x / currentGameScale + member.mouseRawX * 1 / currentGameScale;
                const mouseGameY = gameContainer.pivot.y - app.stage.position.y / currentGameScale + member.mouseRawY * 1 / currentGameScale;
                if (member) {
                    onScreenIcons.push({
                        icon: 'location_on',
                        text: 'Direction',
                        x: mouseGameX,
                        y: mouseGameY,
                        party: false,
                        color: '#FFF',
                        opacity: 1,
                        lasttime: Date.now() * 0.001
                    });
                }
            }

            if (button == activeKeybinds.kMarkFood) {
                key.preventDefault();
                var member = getActivePlayer();
                const currentGameScale = member.scale;
                const mouseGameX = gameContainer.pivot.x - app.stage.position.x / currentGameScale + member.mouseRawX * 1 / currentGameScale;
                const mouseGameY = gameContainer.pivot.y - app.stage.position.y / currentGameScale + member.mouseRawY * 1 / currentGameScale;
                if (member) {
                    onScreenIcons.push({
                        icon: 'lunch_dining',
                        text: 'Food',
                        x: mouseGameX,
                        y: mouseGameY,
                        party: false,
                        color: '#bfff00',
                        opacity: 1,
                        lasttime: Date.now() * 0.001
                    });
                }
            }

            // Then in the keybind handler
            if (button == activeKeybinds.kToggleShowMass) {
                key.preventDefault()
                toggleMass = !toggleMass
                saveUserSettings()
                showFastFeedModeNotification("Show Mass: " + (toggleMass ? "OFF" : "ON"))
            }

            // Then in the keybind handler
            if (button == activeKeybinds.kToggleHideChat) {
                key.preventDefault()
                toggleChat = !toggleChat
                saveUserSettings()
                showFastFeedModeNotification("Hide Chat: " + (toggleChat ? "OFF" : "ON"))
            }

            // Then in the keybind handler
            if (button == activeKeybinds.kToggleHideSkins) {
                key.preventDefault()
                toggleSkins = !toggleSkins
                saveUserSettings()
                showFastFeedModeNotification("Show Skins: " + (toggleSkins ? "OFF" : "ON"))
            }

            if (button == activeKeybinds.kToggleShowNames) {
                key.preventDefault()
                toggleName = !toggleName
                saveUserSettings()
                showFastFeedModeNotification("Show Names: " + (toggleName ? "ON" : "OFF"))
            }

            if (button == activeKeybinds.kAutoReverse1X) {
                key.preventDefault()

                quickSplitEnabled = !quickSplitEnabled
                doubleSplitEnabled = !![]
                regularDoubleSplitEnabled = ![]
                tripleSplitEnabled = ![]
                quadrupleSplitEnabled = ![]
                sextupleSplitEnabled = ![]
            }

            if (button == activeKeybinds.kAutoReverse2X) {
                key.preventDefault()

                quickSplitEnabled = !quickSplitEnabled
                regularDoubleSplitEnabled = !![]
                doubleSplitEnabled = ![]
                tripleSplitEnabled = ![]
                quadrupleSplitEnabled = ![]
                sextupleSplitEnabled = ![]
            }

            if (button == activeKeybinds.kDiagLine) {
                key.preventDefault()
                let Nl = getActivePlayer()
                if (!Nl.mouseFrozen) {
                    Nl.mouseFrozen = !![]
                    for (let Nd = 0x0; Nd < 0x3; Nd++) {
                        Nl.sendPacket(new network.sendKey(0x11))
                    }
                    setTimeout(() => {
                        Nl.mouseFrozen = ![]
                    }, 0x4b0)
                }
                return
            }

            if (button == activeKeybinds.kSoloMs) {
                key.preventDefault()
                clientSettings.soloMothership = !clientSettings.soloMothership
            }

            if (button == activeKeybinds.kMouseFollow) {
                key.preventDefault()
                clientSettings.mouseFollow = !clientSettings.mouseFollow
            }

            if (button == activeKeybinds.kTrickSplit) {
                key.preventDefault()
                let cell1 = player1
                let cell2 = player2
                var M1 = 0
                var M2 = 0

                // Count cells and sum their masses
                for (var cellId in player1.myCells) M1 += player1.myCells[cellId].getRealMass()
                for (var cellId in player2.myCells) M2 += player2.myCells[cellId].getRealMass()

                const sizeFlag = M1 > M2
                for (let Nd = 0x0; Nd < 0x8; Nd++) {
                    setTimeout(() => {
                        ; (sizeFlag ? cell1 : cell2).sendPacket(new network.sendKey(0x11))
                    }, !!Nd * 200)
                }
                ; (sizeFlag ? cell2 : cell1).sendPacket(new network.sendKey(0x11))
            }

            if (button == activeKeybinds.kInfernoSplit) {
                clientSettings.mouseFollow = !clientSettings.mouseFollow
                key.preventDefault()
                let cell1 = player1
                let cell2 = player2
                var M1 = 0
                var M2 = 0

                var activePlayer = getActivePlayer()
                var inactivePlayer = activePlayer === player1 ? player2 : player1

                for (let Nd = 0x0; Nd < 0x4; Nd++) {
                    setTimeout(() => {
                        inactivePlayer.sendPacket(new network.sendKey(0x11))
                    }, Nd * 20)
                }
                for (let Nd = 0x0; Nd < 0x2; Nd++) {
                    setTimeout(() => {
                        activePlayer.sendPacket(new network.sendKey(0x11))
                    }, Nd * 20)
                }

                clientSettings.mouseFollow = !clientSettings.mouseFollow
            }
            if (button == activeKeybinds.kFixCellLocation && !mousefix) {
                key.preventDefault()
                mousefix = 1
                macroIntervalID = setInterval(() => {
                    player1.sendPacket(new network.sendMouse(0xfffffff * macroIterations, 0))
                    player2.sendPacket(new network.sendMouse(0xfffffff * macroIterations, 0))
                    macroIterations *= -1
                }, 7)
            }

            if (button == activeKeybinds.kLineSplit) {
                // Use YOUR correct keybind variable
                key.preventDefault()
                lineSplitHelper.activateLinesplitToggle()
                return
                // Prevent default game handling for this key
            }

            // Toggle biggest cell camera mode with B key
            if (button == activeKeybinds.kBiggestCellMode) {
                key.preventDefault()

                // Create notification container if it doesn't exist
                if (!$("#camera-mode-notification").length) {
                    $('<div id="camera-mode-notification" style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000;"></div>').appendTo(document.body)
                }

                // Toggle camera mode for active player

                let nextMode
                let notificationLabel
                const currentMode = clientSettings.sCameraMode

                if (currentMode === "default") {
                    nextMode = "mass"
                    notificationLabel = "Mass-Weighted"
                } else if (currentMode === "mass") {
                    nextMode = "ultrasmooth"
                    notificationLabel = "Ultra Smooth"
                } else {
                    nextMode = "default"
                    notificationLabel = "Default"
                }

                clientSettings.sCameraMode = nextMode
                // Update the setting

                // Show notification of the NEW camera mode change
                showsCameraModeNotification("Player Camera: " + notificationLabel)
                console.log("Camera mode changed to: " + clientSettings.sCameraMode)
                // You might need to add specific logic resets or setup based on entering 'smooth' mode here if required.
                return
            }

            ; (player1.enabled ? player1 : player2).handleKey(button)
        }
        window.onkeyup = function (key) {
            var button = key.which || key.keyCode || key.charCode

            if (button == activeKeybinds.kLineSplit) {
                // Use YOUR correct keybind variable
                lineSplitHelper.deactivateLinesplitHold()
            }

            if (button == keyMappings.kEjectMass) {
                _0x12836 = false
                    ; (player1.enabled ? player1 : player2).sendPacket(new network.sendEjectMass(false))
            }

            // Add this block for multi-eject keyup
            if (button == activeKeybinds.kMultiEject) {
                var activePlayer = getActivePlayer()
                var inactivePlayer = activePlayer === player1 ? player2 : player1

                if (inactivePlayer) {
                    inactivePlayer.sendPacket(new network.sendEjectMass(false))
                }
            }

            if (button == (activeKeybinds.kDoubleSplit || activeKeybinds.kSplit || activeKeybinds.kQuadSplit || activeKeybinds.kHexaSplit || activeKeybinds.kTripleSplit || activeKeybinds.kSwitchTab)) {
                hasSplit = false
            }

            if (button == keyMappings.kFixCellLocation) {
                clearInterval(macroIntervalID)
                mousefix = 0
            }
        }
        window.onblur = function (_0x111D7) {
            if (_0x12836 && clientSettings.cDisablePersistEjectMass) {
                _0x12836 = false
                    ; (player1.enabled ? player1 : player2).sendPacket(new network.sendEjectMass(false))
            }
        }
        document.addEventListener("contextmenu", function (e) {
            e.preventDefault()
        })
        _0x11D9C()
        initializeEmoteLists()
        var _0x1121C = window.location.href.split("#").slice(1).join("#").split("&")
        var _0x1124A = ""
        if (_0x1121C[0]) {
            _0x1124A = _0x1121C[0].toLowerCase()
        }
        if (_0x1121C[1]) {
            partyCodeVariable = _0x1121C[1]
        }
        if (_0x1124A != null && _0x1124A != "") {
            _0x1124A = _0x1124A[0].toUpperCase() + _0x1124A.slice(1)
            currentServerList = function () {
                var _0x111D7 = null
                if ((_0x111D7 = findServerByName(_0x1124A)) != null) {
                    selectServer(_0x111D7.name)
                    setActiveServerTab(_0x111D7.region)
                } else {
                    handleServerSelection()
                }
            }
        } else {
            JG = handleServerSelection
        }
        fb_app1
            .database()
            .ref("/game")
            .on("value", function (_0x1121C) {
                var _0x111D7 = _0x1121C.val()
                if (_0x111D7.version !== version) {
                    player1.selfMsg("Woah! Version " + _0x111D7.version + " is now available. Press Ctrl+R to update!")
                }
                if (messageOfTheDay != _0x111D7.motd && _0x111D7.motd !== "") {
                    messageOfTheDay = _0x111D7.motd
                    player1.selfMsg(_0x111D7.motd)
                }
                if (_0x111D7.listRefresh != listRefreshTimestamp) {
                    listRefreshTimestamp = _0x111D7.listRefresh
                    serverList = {}
                    fetchServerList(currentServerList)
                    clearInterval(serverListInterval)
                    serverListInterval = setInterval(() => {
                        fetchServerList()
                    }, _0x111D7.listRefresh)
                }
                for (var _0x111EE in _0x111D7.titles) {
                    _0x12739[_0x111EE] = _0x111D7.titles[_0x111EE]
                }
            })

        $("#refresh-servers").on("click", () => {
            $("#servers-body-eu").html("")
            $("#servers-body-na").html("")
            console.log("refreshing servers")
            fetchServerList()
        })

        /**
         * Fetch server list from the API
         * @param {Function|undefined} callback - Optional callback function to execute after fetching servers
         */
        function fetchServerList(callback) {
            // callback may be undefined when called from setInterval
            jQuery.ajax({
                type: "GET",
                dataType: "json",
                url: ACCOUNTS_URL + "/api/v1/utilities/servers",
                success: function (response) {
                    console.log("servers", response)
                    for (var regionData of response) {
                        var serversList = []
                        for (var serverData of regionData.servers) {
                            serverData.players = parseInt(serverData.players)
                            serverData.bots = serverData.bots || 0
                            var playersCount = serverData.players + serverData.bots + "/" + serverData.playersMax
                            if (serverData.bots > 0) {
                                playersCount += "*"
                            }
                            var server = new ServerInfo(serverData.name, serverData.address, serverData.players, serverData.bots, playersCount, serverData.gamemode, regionData.region, serverData.ssl, serverData.order)

                            serversList.push(server)
                        }
                        serversList.sort((server1, server2) => {
                            return server1.order - server2.order
                        })
                        serverList[regionData.region] = {}
                        for (var index = 0; index < serversList.length; index++) {
                            var server = serversList[index]
                            serverList[regionData.region][server.name] = server
                        }
                    }
                    updateServerListUI()
                    if (callback != null) {
                        callback()
                    } else {
                        if (selectedServer != null) {
                            selectServer(selectedServer.name)
                        }
                    }
                },
                error: function (error) {
                    updateServerListUI()
                    console.error("Error fetching server list:", error)
                }
            })
        }

        function handleServerSelection() {
            if (selectedServer != null) {
                selectServer(selectedServer.name)
                // p.name
                return
            }
            setActiveServerTab("eu")
            selectServer("Vendetta")
        }
        skinTextureCache = {}
        skinLoadingStatus = {}
        initializeGameUI()
        $(window).unload(handleWindowUnload)
        window.addEventListener("beforeunload", handleWindowUnload)
        player1 = new PlayerOneClient()
        player2 = new PlayerTwoClient()
        network = new NetworkProtocol()
        initializeColorPickers()
        _0x1163E.init()
        _0x12317()
        var _0x11233 = {
            view: canvas,
            backgroundAlpha: 0,
            forceCanvas: clientSettings.sRenderType === "CANVAS",
            antialias: !clientSettings.cDisableAA,
            powerPreference: "high-performance"
        }
        _0x11233.perform

        app = {
            renderer: PIXI.autoDetectRenderer(_0x11233),
            stage: stage
        }
        //Y
        tempX = createCircleTexture(BASE_CELL_SIZE)
        // Circle texture with BASE_CELL_SIZE
        tempY = createCircleTexture(32)
        // Circle texture with 32px size
        tempZ = createCircleTexture(8)
        // Circle texture with 8px size
        $(window).resize(resizeCanvas)
        resizeCanvas()
        lastFrameTime = Date.now()
        fps = 0
        player1.selfMsg("Welcome to Gota.io - Enhanced By Dual Project!")
        if (eventSettings.enabled && eventSettings.motd !== "") {
            player1.selfMsg(eventSettings.motd)
        }
        _0x127C3()

        requestAnimationFrame(gameLoop)
    }

    var Js = 0x0
    var Jj = null
    var Jo = ![]
    var JM = ![]
    var Jn = ![]
    var Jf = ![]
    var Jb = ![]
    var Jh = ![]
    var fastFeedActive = ![]
    /**
     * Returns the currently active player (player1 or player2)
     * Also handles smooth transitions when switching between players
     * @returns {Object|null} The active player object or null if no player is active
     */
    function getActivePlayer() {
        // Get the previously active player (if any)
        const previouslyActive = window.sharedData ?
            (window.sharedData.player1 ? player1 :
             window.sharedData.player2 ? player2 : null) : null;

        // Determine current active player
        let currentActive = null;
        if (player1.enabled === !![]) {
            currentActive = player1;
            window.sharedData = {
                player1: true,
                player2: false,
                mouseFrozenDiv2: hudElements.mouseFrozenDiv2 ? hudElements.mouseFrozenDiv2.style.display : 'none'
            };
        } else if (player2.enabled === !![]) {
            currentActive = player2;
            window.sharedData = {
                player1: false,
                player2: true,
                mouseFrozenDiv2: hudElements.mouseFrozenDiv2 ? hudElements.mouseFrozenDiv2.style.display : 'none'
            };
        }

        // If player has switched, record the switch time for smooth camera transitions
        if (previouslyActive && currentActive && previouslyActive !== currentActive) {
            // Record the time of the switch for smooth camera transitions
            currentActive.lastSwitchTime = Date.now();

            // Store previous camera position for smoother transitions
            if (previouslyActive.centerX && previouslyActive.centerY) {
                currentActive.prevCenterX = previouslyActive.centerX;
                currentActive.prevCenterY = previouslyActive.centerY;
            }

            // If in dual mode, update the global camera position for smoother transitions
            if (clientSettings.cDualMode && dualmodeGlobalCamX !== -1) {
                // No need to change global camera position immediately
                // The game loop will handle the transition smoothly
            }
        }

        return currentActive;
    }

    /**
     * Fast Feed function - Makes the active player rapidly feed mass to the other player
     * If in BiggestCell mode, it automatically targets the biggest cell of the other player
     * If in MouseCursor mode, it uses the current mouse position
     * If in SmartTarget mode, it finds the optimal feeding target based on distance and size
     * The active player is the one currently being controlled
     */
    function fastFeed() {
        var activePlayer = getActivePlayer()

        // Check if player is alive (has cells and is connected)
        if (!activePlayer || !activePlayer.isConnected() || Object.keys(activePlayer.myCells).length === 0) {
            // Player is not alive or not connected, return early
            return
        }

        // Check if other player is alive
        var otherPlayer = activePlayer === player1 ? player2 : player1
        if (!otherPlayer.isConnected() || Object.keys(otherPlayer.myCells).length === 0) {
            // Other player is not alive or not connected, show notification
            showFastFeedModeNotification("Fast Feed: Other player not alive")
            return
        }

        fastFeedActive = !fastFeedActive
        if (fastFeedActive) {
            // Get cells of the other player
            var cells = Object.values(otherPlayer.myCells).filter(function (cell) {
                return cell != null
            })

            if (cells.length === 0) {
                fastFeedActive = ![]
                showFastFeedModeNotification("Fast Feed: No target cells found")
                return
            }

            var targetCell = null

            // Different targeting modes
            if (clientSettings.sFastFeed === "BiggestCell") {
                // Find the biggest cell
                targetCell = cells.reduce(function (biggest, current) {
                    return current.size > biggest.size ? current : biggest
                }, cells[0])
            } else if (clientSettings.sFastFeed === "SmartTarget") {
                // Find the best cell to feed based on distance and size
                var activeCells = Object.values(activePlayer.myCells).filter(function (cell) {
                    return cell != null
                })

                if (activeCells.length > 0) {
                    // Calculate center of mass for active player
                    var centerX = 0,
                        centerY = 0
                    activeCells.forEach(function (cell) {
                        centerX += cell.x
                        centerY += cell.y
                    })
                    centerX /= activeCells.length
                    centerY /= activeCells.length

                    // Find cell with best score (combination of size and proximity)
                    var bestScore = -1
                    cells.forEach(function (cell) {
                        var distance = Math.sqrt(Math.pow(cell.x - centerX, 2) + Math.pow(cell.y - centerY, 2))
                        var sizeScore = cell.size
                        var proximityScore = 10000 / (distance + 100)
                        // Higher score for closer cells
                        var score = sizeScore * proximityScore

                        if (score > bestScore) {
                            bestScore = score
                            targetCell = cell
                        }
                    })
                } else {
                    // Fallback to biggest cell if no active cells
                    targetCell = cells.reduce(function (biggest, current) {
                        return current.size > biggest.size ? current : biggest
                    }, cells[0])
                }
            } else {
                // MouseCursor mode - use current mouse position
                targetCell = null
                // Don't change mouse position
            }

            if (targetCell && !activePlayer.mouseFrozen && clientSettings.sFastFeed !== "MouseCursor" && !mousefix) {
                activePlayer.sendPacket(new network.sendMouse(targetCell.x, targetCell.y))
                activePlayer.mouseFrozen = !![]
            }

            // Adaptive feed amount based on player mass
            var feedAmount = 4
            // Default amount
            var totalMass = 0

            // Calculate total mass of active player
            Object.values(activePlayer.myCells).forEach(function (cell) {
                if (cell && cell.size) {
                    totalMass += Math.pow(cell.size, 2)
                }
            })

            // Adjust feed amount based on mass
            if (totalMass > 40000) feedAmount = 4
            if (totalMass > 80000) feedAmount = 4

            // Send feed commands
            for (var i = 0; i < feedAmount; i++) {
                activePlayer.sendPacket(new network.sendKey(0x11))
            }

            // Show notification with target info
            var targetInfo = clientSettings.sFastFeed
            if (targetCell) {
                targetInfo += " (Size: " + Math.floor(targetCell.size) + ")"
            }
            showFastFeedModeNotification("Fast Feed: " + targetInfo)

            setTimeout(function () {
                fastFeedActive = ![]
                // Send additional feed commands
                var finalFeedAmount = Math.min(15, feedAmount + 3)
                for (var i = 0; i < finalFeedAmount; i++) {
                    activePlayer.sendPacket(new network.sendKey(0x11))
                }
                setTimeout(function () {
                    activePlayer.mouseFrozen = ![]
                }, 600)
            }, 743)
        }
    }

    /**
     * Fast Feed Mode function - Cycles through different fast feed modes
     * Shows a notification similar to camera mode notification
     */
    function cycleFastFeedMode() {
        // Create notification container if it doesn't exist
        if (!$("#fastfeed-mode-notification").length) {
            $('<div id="fastfeed-mode-notification" style="position: fixed; top: 80px; left: 50%; transform: translateX(-50%); z-index: 1000;"></div>').appendTo(document.body)
        }

        // Cycle through modes
        let nextMode
        let notificationLabel
        const currentMode = clientSettings.sFastFeed

        if (currentMode === "MouseCursor") {
            nextMode = "BiggestCell"
            notificationLabel = "Biggest Cell"
        } else if (currentMode === "BiggestCell") {
            nextMode = "SmartTarget"
            notificationLabel = "Smart Target"
        } else {
            nextMode = "MouseCursor"
            notificationLabel = "Mouse Cursor"
        }

        // Update the setting
        clientSettings.sFastFeed = nextMode

        // Show notification
        showFastFeedModeNotification("Fast Feed Mode: " + notificationLabel)
        console.log("Fast Feed mode changed to: " + nextMode)
    }

    /**
     * Function to show fast feed mode notifications
     * @param {string} message - The message to display in the notification
     */
    function showFastFeedModeNotification(message) {
        // Create notification container if it doesn't exist 'position': 'fixed',
        if (!$("#fastfeed-mode-notification").length) {
            $('<div id="fastfeed-mode-notification" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 1000;"></div>').appendTo(document.body)
        }

        // Clear any existing notifications
        $("#fastfeed-mode-notification").empty()

        // Create and style the notification
        const notification = $('<div class="fastfeed-mode-alert">' + message + "</div>")
        notification.css({
            "align-items": "center",
            "background": "linear-gradient(135deg, rgba(155, 63, 241, 0.7), rgba(102, 64, 114, 0.7))",
            "color": "#d3d3d3",
            "padding": "14px 22px",
            "border-radius": "12px",
            "box-shadow": "0 6px 12px rgba(0, 0, 0, 0.3)",
            "cursor": "pointer",
            "font-family": '"Inter", sans-serif',
            "font-size": "14px",
            "font-weight": "500",
            "gap": "10px",
            "opacity": "0",
            "transition": "opacity 0.3s ease-in-out, transform 0.2s ease",
            "backdrop-filter": "blur(8px)",
            "-webkit-backdrop-filter": "blur(8px)",
            "border": "1px solid rgba(255, 255, 255, 0.1)",
            "animation": "slideIn 0.3s ease-out"
        })

        if (!document.getElementById("fastfeed-slidein-style")) {
            const style = document.createElement("style")
            style.id = "fastfeed-slidein-style"
            style.textContent = `
          @keyframes slideIn {
              from { transform: translateY(-20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
          }
      `
            document.head.appendChild(style)
        }

        // Add to the notification container
        $("#fastfeed-mode-notification").append(notification)

        // Fade in, wait, then fade out
        setTimeout(function () {
            notification.css("opacity", "1")

            setTimeout(function () {
                notification.css("opacity", "0")

                setTimeout(function () {
                    notification.remove()
                }, 300)
            }, 2000)
        }, 10)
    }

    // Camera movement constants
    const CAMERA_SPEED_FACTOR = 0.3
    // Controls how quickly the camera moves toward the target position (increased from 0.2 to 0.3)
    const CAMERA_SMOOTHING_FACTOR = 0.8
    // Controls how smoothly the camera transitions between positions (increased from 0.7 to 0.8)
    const CAMERA_ZOOM_FACTOR = 0.15
    // Controls how quickly the zoom level changes (increased from 0.1 to 0.15)
    const CAMERA_MIN_ZOOM = 0.05
    // Minimum zoom level

    // Unused variables from original code
    var Y1 = 0,
        Y2 = 0
    var Y3 = 0,
        Y4 = 0
    // Calculate normalized distance between two points
    function calculateNormalizedDistance(x, y, scale, targetX, targetY) {
        // Calculate Euclidean distance between normalized points
        var distance = Math.sqrt(Math.pow(x / scale - targetX, 2) + Math.pow(y / scale - targetY, 2))
        // Return distance capped at 1.0, scaled by 0.01
        return Math.min(1.0, distance * 0.01)
    }

    let first = false
    function Fbs() {
        player1.play()
        player2.play()

        if (_0x12836 && clientSettings.cDisablePersistEjectMass) {
            if (player1.enabled) {
                player1.sendPacket(new network.sendEjectMass(![]))
                player2.sendPacket(new network.sendEjectMass(!![]))
            } else if (player2.enabled) {
                player2.sendPacket(new network.sendEjectMass(![]))
                player1.sendPacket(new network.sendEjectMass(!![]))
            }
            _0x12836 = ![]
        }
        if (player1.isConnected() && player2.isConnected()) {
            if (player1.enabled && !player2.enabled) {
                player1.enabled = ![]
                player2.enabled = !![]
            } else if (!player1.enabled && player2.enabled) {
                player2.enabled = ![]
                player1.enabled = !![]
            }
        }
    }

    // Add this near your other global variables
    const recommendationCache = {}
    let lastNotificationTime = 0

    var Jl
    var quickSplitEnabled = ![]
    var doubleSplitEnabled = ![]
    var Jpp = ![]
    var Juu = ![]
    // var lastClickedPlayer = ![];
    var regularDoubleSplitEnabled = ![]
    var tripleSplitEnabled = ![]
    var quadrupleSplitEnabled = ![]
    var sextupleSplitEnabled = ![]
    var autoRevVariable = true
    //  var targetPlayerName = autoRevVariable ? "None" : "No Package";
    var Jc = 0x0
    // var targetPlayerSize = 0x0;
    //     var playerSizeHistory = new Map();
    var sizeChangeThreshold = 0.002

    var lastClickedPlayer = false
    var playerSizeHistory = new Map()
    var globalSizeCache = new Map()
    var targetPlayerName = "None"
    var targetPlayerSize = 0
    var myPlayerID = null
    var mySplitRecommendation = "None"
    var displayElementId = "split-calculator-display"

    function JU(cursorX, cursorY, gameClient, isButtonPressed) {
        // Function to send a split action packet to the server
        const sendSplitPacket = () => gameClient.sendPacket(new network.sendKey(0x11))

        // If button is pressed and we have a selected player
        if (isButtonPressed && lastClickedPlayer) {
            const targetPlayer = gameClient["bucket"][lastClickedPlayer]
            if (targetPlayer) {
                const previousSize = playerSizeHistory["get"](lastClickedPlayer)
                const currentSize = targetPlayer["size"]

                // If we have previous size data for this player
                if (previousSize !== undefined) {
                    // Calculate the proportional size change
                    let sizeChangeRatio = (previousSize - currentSize) / previousSize

                    // If size change exceeds threshold, trigger split actions
                    if (sizeChangeRatio >= sizeChangeThreshold) {
                        if (doubleSplitEnabled || regularDoubleSplitEnabled) {
                            sendSplitPacket()
                            if (regularDoubleSplitEnabled) sendSplitPacket()
                        } else if (tripleSplitEnabled) {
                            for (let i = 0; i < 3; i++) sendSplitPacket()
                        } else if (quadrupleSplitEnabled) {
                            for (let i = 0; i < 4; i++) sendSplitPacket()
                        } else if (sextupleSplitEnabled) {
                            for (let i = 0; i < 6; i++) sendSplitPacket()
                        }
                        quickSplitEnabled = false
                    }
                }

                // Update our tracking of this player
                playerSizeHistory["set"](lastClickedPlayer, currentSize)
                targetPlayerSize = currentSize

                // Get and store player name
                const playerObject = gameClient["playerRegistry"]["getPlayerById"](targetPlayer["playerId"])
                targetPlayerName = playerObject["name"]
                return null
            }
        }

        // If button is not pressed, find the closest player to the cursor
        if (!isButtonPressed) {
            let closestPlayer = null
            let shortestDistance = Infinity

            // Loop through all players to find the closest one
            for (const playerId in gameClient["bucket"]) {
                const player = gameClient["bucket"][playerId]
                if (player && player["x"] !== undefined && player["y"] !== undefined && player["size"] !== undefined) {
                    // Calculate distance from cursor to player
                    const distance = Math.sqrt(Math.pow(cursorX - player["x"], 2) + Math.pow(cursorY - player["y"], 2))

                    // If cursor is over this player and it's the closest one so far
                    if (distance <= player["size"] && distance < shortestDistance) {
                        shortestDistance = distance
                        closestPlayer = player
                    }
                }
            }

            // If we found a player, update our tracking
            if (closestPlayer) {
                const playerObject = gameClient["playerRegistry"]["getPlayerById"](closestPlayer["playerId"])
                targetPlayerSize = closestPlayer["size"]
                targetPlayerName = playerObject["name"]
                lastClickedPlayer = closestPlayer["id"]
                playerSizeHistory["set"](closestPlayer["id"], closestPlayer["size"])
            }
        }

        return null
    }

    // Adjusts canvas and renderer dimensions based on the window size.
    function resizeCanvas() {
        canvas.width = window.innerWidth * clientOptions.resolution
        // clientOptions DV
        canvas.height = window.innerHeight * clientOptions.resolution
        app.renderer.resize(canvas.width, canvas.height)
        app.stage.position.x = (window.innerWidth * clientOptions.resolution) / 0x2
        app.stage.position.y = (window.innerHeight * clientOptions.resolution) / 0x2

        // Update background size if it exists
        updateBackgroundSize()
    }

    /**
     * Updates the size and position of the background sprite to cover the entire game area
     * Supports different scaling modes for the background image
     * Uses the exact border dimensions from the server data
     */
    function updateBackgroundSize() {
        if (backgroundSprite && player1 && player1.serverData && player1.serverData.border) {
            // Get the exact border dimensions from the server data
            const border = player1.serverData.border

            // Calculate the exact width and height of the border
            const borderWidth = border.width
            const borderHeight = border.height

            // Get the original texture dimensions
            const origWidth = backgroundSprite.texture.orig.width
            const origHeight = backgroundSprite.texture.orig.height

            // Calculate aspect ratios
            const borderAspect = borderWidth / borderHeight
            const imageAspect = origWidth / origHeight

            let targetWidth, targetHeight

            // Get scaling mode from theme settings
            const scalingMode = uiTheme.sBackgroundScalingMode || "cover"
            // Options: 'cover', 'contain', 'stretch'

            if (scalingMode === "cover") {
                // Cover mode: ensure image covers entire border area (may crop image)
                if (imageAspect > borderAspect) {
                    // Image is wider than border area
                    targetHeight = borderHeight
                    targetWidth = targetHeight * imageAspect
                } else {
                    // Image is taller than border area
                    targetWidth = borderWidth
                    targetHeight = targetWidth / imageAspect
                }
            } else if (scalingMode === "contain") {
                // Contain mode: ensure entire image is visible (may show empty space)
                if (imageAspect > borderAspect) {
                    // Image is wider than border area
                    targetWidth = borderWidth
                    targetHeight = targetWidth / imageAspect
                } else {
                    // Image is taller than border area
                    targetHeight = borderHeight
                    targetWidth = targetHeight * imageAspect
                }
            } else {
                // Stretch mode: stretch image to fit border area exactly
                targetWidth = borderWidth
                targetHeight = borderHeight
            }

            // Set the background sprite size
            backgroundSprite.width = targetWidth
            backgroundSprite.height = targetHeight

            // Position the background sprite at the exact border position
            backgroundSprite.position.x = border.left
            backgroundSprite.position.y = border.top

            // Set the background sprite to be behind everything else
            backgroundSprite.zIndex = -1000

            // Log the dimensions for debugging
            console.log(`Background updated: ${targetWidth}x${targetHeight}, Border: ${borderWidth}x${borderHeight}`)
        } else if (backgroundSprite) {
            // Fallback if border data isn't available
            const defaultSize = 14142
            backgroundSprite.width = defaultSize
            backgroundSprite.height = defaultSize
            backgroundSprite.position.x = -defaultSize / 2
            backgroundSprite.position.y = -defaultSize / 2
            backgroundSprite.zIndex = -1000
        }
    }

    function createCircleTexture(size) {
        const cacheKey = `circle-r${BASE_CELL_SIZE}-res${window.devicePixelRatio}`

        if (circleTextureCacheInternal.has(cacheKey)) {
            // If found, return the cached texture directly
            return circleTextureCacheInternal.get(cacheKey)
        }

        // size parameter is used to identify the texture size
        var graphics = new PIXI.Graphics()
        graphics.beginFill(16777215)
        graphics.drawCircle(0, 0, BASE_CELL_SIZE)
        graphics.endFill()
        var renderTexture = PIXI.RenderTexture.create({
            width: graphics.width,
            height: graphics.height,
            multisample: PIXI.MSAA_QUALITY.HIGH,
            resolution: window.devicePixelRatio
        })

        renderTexture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR
        renderTexture.baseTexture.mipmap = PIXI.MIPMAP_MODES.OFF

        app.renderer.render(graphics, {
            renderTexture: renderTexture,
            transform: new PIXI.Matrix(1, 0, 0, 1, graphics.width / 2, graphics.height / 2)
        })
        if (app.renderer.framebuffer) {
            app.renderer.framebuffer.blit()
        }
        graphics.destroy(true)

        circleTextureCacheInternal.set(cacheKey, renderTexture)

        return renderTexture
    }
    // Iterates over properties of the given settings object (_0x126F4)
    // and calls the provided callback for every key starting with "u".
    function iterateUserSettings(callback) {
        for (var key in uiTheme) {
            if (key.charAt(0) == "u") {
                callback(key)
            }
        }
    }

    function motherShips(mouseX, mouseY) {
        var activePlayer = getActivePlayer()
        var inactivePlayer = activePlayer === player1 ? player2 : player1
        // messy

        if (clientSettings.soloMothership) {
            if (!inactivePlayer.mouseFrozen && !hasSplit && !clientSettings.mouseFollow) {
                // Use the stored calculated mouse position from the active player for better consistency
                const targetX = activePlayer.calculatedMouseX || mouseX;
                const targetY = activePlayer.calculatedMouseY || mouseY;
                inactivePlayer.sendPacket(new network.sendMouse(targetX, targetY))
            }
            if (hasSplit) {
                for (var i = 0; i < 8; i++) {
                    inactivePlayer.sendPacket(new network.sendKey(0x11))
                }
                clientSettings.soloMothership = false
            }
        }
    }

    //Mouse follow

    function MouseFollow(mouseX, mouseY) {
        var activePlayer = getActivePlayer()
        var inactivePlayer = activePlayer === player1 ? player2 : player1

        if (clientSettings.mouseFollow) {
            if (!inactivePlayer.mouseFrozen) {
                // Use the stored calculated mouse position from the active player for better consistency
                const targetX = activePlayer.calculatedMouseX || mouseX;
                const targetY = activePlayer.calculatedMouseY || mouseY;
                inactivePlayer.sendPacket(new network.sendMouse(targetX, targetY))
            }
        }
    }

    function hideUIElements() {
        if (toggleName) clientOptions.levelNames = CellVisibility.NONE
        else clientOptions.levelNames = CellVisibility[clientSettings.sShowNames]

        if (toggleMass) clientOptions.levelMass = CellVisibility.NONE
        else clientOptions.levelMass = CellVisibility[clientSettings.sShowMass]

        if (toggleSkins) clientOptions.levelSkins = CellVisibility.NONE
        else clientOptions.levelSkins = CellVisibility[clientSettings.sShowSkins]

        if (toggleChat) $("#chat-panel").css("display", "none")
        else $("#chat-panel").css("display", "block")
    }

    // Add near other loop variables
    let frameCounter = 0
    const MINIMAP_UPDATE_INTERVAL = 5
    // Update every 5 frames (adjust)

    // Performance optimization variables
    const CAMERA_CALC_INTERVAL = 2  // Calculate camera parameters every N frames
    const HEAVY_CALC_INTERVAL = 4   // Perform expensive calculations every N frames
    var lastCameraCalcTime = 0      // Last time camera calculations were performed
    var cameraCalcDuration = 0      // Duration of camera calculations
    var cameraCalcCount = 0         // Count of camera calculations
    var avgCameraCalcTime = 0       // Average time for camera calculations

    // Cache for frequently used values
    var cachedCameraValues = {
        targetX: 0,
        targetY: 0,
        distanceToTarget: 0,
        interpolationFactor: 1.0,
        easeFactor: 0,
        desiredScale: 0,
        lastUpdateFrame: -1,
        lastMovementUpdateFrame: -1,
        lastZoomUpdateFrame: -1,
        lastScaleBase: 0,
        totalMass: 0,
        cellCount: 0,
        playerDistance: 0
    }

    var quickSplitEnabled = ![]
    function gameLoop() {
        // Halt check - ensure initial integrity check passed before proceeding

        var elapsedTime = Date.now() - lastFrameTime
        lastFrameTime = Date.now()
        var delta = Math.min(elapsedTime / clientSettings.rAnimationDelay, 1)
        accumulatedTime += elapsedTime

        const player = getActivePlayer()

        // --- ADD THESE ---
        const currentScale = player.scale
        // Cache player's scale
        const viewCenterX = gameContainer.pivot.x
        // Cache pivot X
        const viewCenterY = gameContainer.pivot.y
        // Cache pivot Y
        const winWidth = window.innerWidth
        // Cache window width
        const winHeight = window.innerHeight
        // Cache window height
        const stagePosX = app.stage.position.x
        // Cache stage position X
        const stagePosY = app.stage.position.y
        // Cache stage position Y
        const isMainMenuHidden = mainUI.css("display") == "none"
        // Cache main menu visibility
        const resolution = clientOptions.resolution
        // Cache resolution

        const viewHalfWidth = winWidth / 2 / currentScale
        // Use cached vars
        const viewHalfHeight = winHeight / 2 / currentScale
        // Use cached vars
        const viewLeft = viewCenterX - viewHalfWidth - 50
        const viewRight = viewCenterX + viewHalfWidth + 50
        const viewTop = viewCenterY - viewHalfHeight - 50
        const viewBottom = viewCenterY + viewHalfHeight + 50

        // --- Periodic Fetched Security Check Removed ---
        // (Integrity check is now performed once during initialization in fetchProtectedLogic)
        // --- End Security Check ---

        let mouseGameX = 0,
            mouseGameY = 0
        if (player) {
            // Enhanced mouse position calculation using the view center
            // This works the same for both dual mode and non-dual mode
            // Ensures consistent mouse position handling between modes
            const mouseBaseX = viewCenterX - stagePosX / currentScale;
            const mouseBaseY = viewCenterY - stagePosY / currentScale;

            // Use the same mouse position calculation for both dual mode and non-dual mode
            mouseGameX = mouseBaseX + (player.mouseRawX * resolution) / currentScale;
            mouseGameY = mouseBaseY + (player.mouseRawY * resolution) / currentScale;

            // Store the calculated mouse position for use by both players in dual mode
            player.calculatedMouseX = mouseGameX;
            player.calculatedMouseY = mouseGameY;

            // Also store the calculated mouse position for the inactive player
            // This ensures both players have access to the same calculated mouse position
            const inactivePlayer = player === player1 ? player2 : player1;
            if (inactivePlayer) {
                inactivePlayer.calculatedMouseX = mouseGameX;
                inactivePlayer.calculatedMouseY = mouseGameY;
            }
        }

        // Update food objects if the scale is high enough or auto-food hiding is disabled.
        if ((player.scale > 0.12 || clientSettings.cDisableAutoFoodHiding) && !clientSettings.cHideFood) {
            foodContainer.visible = true
            for (const food of player.foodObjects.values()) {
                // AFTER - if you only need the value
                // var food = player.foodObjects[id]; // BEFORE - line no longer needed
                // if (food.steps > 0) {
                //     food.animate(delta);
                // }
                food.handleFood()
            }
        } else {
            foodContainer.visible = false
        }

        // --- Cell Rendering (Player 1) ---
        for (const cell of player1.bucket.values()) {
            if (cell.steps > 0) {
                // Check if animation steps remain
                cell.animate(delta)
                // Pass cached delta
            }
            // --- Optimization: Use pre-calculated visibility check ---
            const cellRadius = cell.size
            const isVisible = cell.x + cellRadius > viewLeft && cell.x - cellRadius < viewRight && cell.y + cellRadius > viewTop && cell.y - cellRadius < viewBottom

            if (isVisible) {
                if (cell.container) cell.container.visible = true
                // Ensure visible
                else if (cell.sprite) cell.sprite.visible = true
                cell.handle(player1)
                // Handle visible cells
            } else {
                // Hide PIXI object if off-screen
                if (cell.container) cell.container.visible = false
                else if (cell.sprite) cell.sprite.visible = false
            }

            // --- End visibility check ---
        }
        // --- End Cell Rendering (Player 1) ---

        // --- Cell Rendering (Player 2 - if applicable) ---
        // If player2 logic is active, repeat the optimized loop structure for player2.bucket

        for (const cell of player2.bucket.values()) {
            if (cell.steps > 0) {
                cell.animate(delta)
                // Pass cached delta
            }
            const cellRadius = cell.size
            const isVisible = cell.x + cellRadius > viewLeft && cell.x - cellRadius < viewRight && cell.y + cellRadius > viewTop && cell.y - cellRadius < viewBottom && !(player1 && player1.bucket.has(cell.id) && ((player1.bucket.get(cell.id).sprite && player1.bucket.get(cell.id).sprite.visible == true) || (player1.bucket.get(cell.id).container && player1.bucket.get(cell.id).container.visible == true)))
            if (isVisible) {
                if (cell.container) cell.container.visible = true
                else if (cell.sprite) cell.sprite.visible = true
                cell.handle(player2)
            } else {
                if (cell.container) cell.container.visible = false
                else if (cell.sprite) cell.sprite.visible = false
            }
        }

        let targetX = 0,
            targetY = 0,
            totalSize = 0

        // Step 1: Calculate Target Position based on Mode

        // Performance optimization: Only recalculate camera target position every CAMERA_CALC_INTERVAL frames
        // or when there's a significant change in the game state
        const shouldRecalculateCamera =
            frameCounter % CAMERA_CALC_INTERVAL === 0 ||
            cachedCameraValues.lastUpdateFrame === -1 ||
            Object.keys(player.myCells).length !== cachedCameraValues.cellCount;

        if (shouldRecalculateCamera) {
            // Start timing the camera calculations
            const cameraCalcStartTime = performance.now();

            // Store the current cell count for change detection
            cachedCameraValues.cellCount = Object.keys(player.myCells).length;

            const myCells = player.myCells;
            // Cache myCells reference
            const cellCount = Object.keys(myCells).length;
            const inactPlayer = getActivePlayer() == player1 ? player2 : player1;
            let wX = 0, wY = 0, totalMass = 0;
            //this is entirely for Dual cam mode

            if (cellCount > 0) {
                if (clientSettings.sCameraMode === "mass") {
                    // Weighted X/Y - Optimized loop with fewer calculations per iteration
                    // Pre-calculate cell IDs to avoid repeated Object.keys calls
                    const cellIds = Object.keys(myCells);

                    // Use a more efficient loop
                    for (let i = 0; i < cellIds.length; i++) {
                        const obj = myCells[cellIds[i]];
                        const cellMass = obj.getMass();
                        wX += obj.x * cellMass;
                        wY += obj.y * cellMass;
                        totalMass += cellMass;
                        totalSize += obj.size;
                    }

                    targetX = totalMass > 0 ? wX / totalMass : (cellCount > 0 ? myCells[cellIds[0]]?.x : player.centerX);
                    targetY = totalMass > 0 ? wY / totalMass : (cellCount > 0 ? myCells[cellIds[0]]?.y : player.centerY);

                    // Only perform dual mode calculations if necessary
                    if (clientSettings.cDualMode && totalMass > 0 && inactPlayer) {
                        const inactCell = inactPlayer.myCells;
                        const inactCellIds = Object.keys(inactCell);
                        const inactCount = inactCellIds.length;

                        // Only proceed if there are inactive cells to consider
                        if (inactCount > 0) {
                            let wX2 = 0, wY2 = 0, totalMass2 = 0, totalSize2 = 0;

                            // Optimized loop for inactive cells
                            for (let i = 0; i < inactCellIds.length; i++) {
                                const obj = inactCell[inactCellIds[i]];
                                const cellMass = obj.getMass();
                                wX2 += obj.x * cellMass;
                                wY2 += obj.y * cellMass;
                                totalMass2 += cellMass;
                                totalSize2 += obj.size;
                            }

                            if (totalSize2 > 0) {
                                const actX = wX / totalMass;
                                const actY = wY / totalMass;
                                const inactX = wX2 / totalMass2;
                                const inactY = wY2 / totalMass2;

                                // Optimize the distance calculation
                                const dx = inactX - actX;
                                const dy = inactY - actY;
                                const distSquared = dx * dx + dy * dy;

                                // Simplified calculation with fewer operations
                                const effectingFactor = (1000000 - Math.min(Math.max(0, distSquared * player.scale - 250000), 1000000)) / 1000000;
                                targetX = (wX + wX2 * effectingFactor) / (totalMass + totalMass2 * effectingFactor);
                                targetY = (wY + wY2 * effectingFactor) / (totalMass + totalMass2 * effectingFactor);
                            }
                        }
                    }
                } else {
                    // Covers 'default' and 'smooth' - calculate the simple average center first
                    // Pre-calculate cell IDs to avoid repeated Object.keys calls
                    const cellIds = Object.keys(myCells);
                    let sumX = 0, sumY = 0;

                    // Optimized loop
                    for (let i = 0; i < cellIds.length; i++) {
                        const obj = myCells[cellIds[i]];
                        sumX += obj.x;
                        sumY += obj.y;
                        totalSize += obj.size;
                    }

                    targetX = sumX / cellCount;
                    targetY = sumY / cellCount;

                    // Only perform dual mode calculations if necessary
                    if (clientSettings.cDualMode && cellCount > 0 && inactPlayer) {
                        const inactCell = inactPlayer.myCells;
                        const inactCellIds = Object.keys(inactCell);
                        const inactCount = inactCellIds.length;

                        // Only proceed if there are inactive cells to consider
                        if (inactCount > 0) {
                            let wX2 = 0, wY2 = 0, totalSize2 = 0;

                            // Optimized loop for inactive cells
                            for (let i = 0; i < inactCellIds.length; i++) {
                                const obj = inactCell[inactCellIds[i]];
                                wX2 += obj.x;
                                wY2 += obj.y;
                                totalSize2 += obj.size;
                            }

                            if (totalSize2 > 0) {
                                const actX = sumX / cellCount;
                                const actY = sumY / cellCount;
                                const inactX = wX2 / inactCount;
                                const inactY = wY2 / inactCount;

                                // Optimize the distance calculation
                                const dx = inactX - actX;
                                const dy = inactY - actY;
                                const distSquared = dx * dx + dy * dy;

                                // Simplified calculation with fewer operations
                                const effectingFactor = (1000000 - Math.min(Math.max(0, distSquared * player.scale - 250000), 1000000)) / 1000000;
                                targetX = (sumX + wX2 * effectingFactor) / (cellCount + inactCount * effectingFactor);
                                targetY = (sumY + wY2 * effectingFactor) / (cellCount + inactCount * effectingFactor);
                            }
                        }
                    }
                }

                // Optimize zoom calculation
                const screenRatio = Math.max(1920 / 0x438, 1080 / 0x780);
                if (clientSettings.cDisableAutoZoom || clientSettings.cDualMode) {
                    player.scale_base = 0.2 * screenRatio;
                } else {
                    // Cache the calculation for better performance
                    const zoomFactor = Math.min(0x10 / totalSize, 0x1);
                    player.scale_base = Math.pow(zoomFactor, 0.2) * screenRatio;
                }
            } else if (player1.spectate) {
                targetX = player.centerX_;
                targetY = player.centerY_;
            } else {
                targetX = player.centerX;
                targetY = player.centerY;
            }

            // Cache the calculated values
            cachedCameraValues.targetX = targetX;
            cachedCameraValues.targetY = targetY;
            cachedCameraValues.lastUpdateFrame = frameCounter;

            // Calculate and store performance metrics
            const cameraCalcEndTime = performance.now();
            cameraCalcDuration += (cameraCalcEndTime - cameraCalcStartTime);
            cameraCalcCount++;

            // Update average calculation time every 100 calculations
            if (cameraCalcCount >= 100) {
                avgCameraCalcTime = cameraCalcDuration / cameraCalcCount;
                cameraCalcDuration = 0;
                cameraCalcCount = 0;

                // Log performance metrics occasionally
                if (frameCounter % 1000 === 0) {
                    console.log(`Camera calc avg time: ${avgCameraCalcTime.toFixed(2)}ms`);
                }
            }
        } else {
            // Use cached values when not recalculating
            targetX = cachedCameraValues.targetX;
            targetY = cachedCameraValues.targetY;
        }

        // Step 2: Apply Smoothing / Camera Movement based on Mode

        // Enhanced camera movement constants
        // Define only the constants we actually use
        const CAMERA_ZOOM_FACTOR = 0.2
        // Controls how quickly the zoom level changes (increased from 0.15 to 0.2 for better responsiveness)

        // Store previous camera positions for smoother player switching
        if (!player.prevCenterX) {
            player.prevCenterX = player.centerX
            player.prevCenterY = player.centerY
        }

        // Performance optimization: Only recalculate camera movement parameters every CAMERA_CALC_INTERVAL frames
        // or when there's a significant change in the game state
        const shouldRecalculateMovement =
            frameCounter % CAMERA_CALC_INTERVAL === 0 ||
            cachedCameraValues.lastMovementUpdateFrame === -1 ||
            Math.abs(cachedCameraValues.targetX - targetX) > 50 ||
            Math.abs(cachedCameraValues.targetY - targetY) > 50;

        let interpolationFactor, easeFactor, distanceToTarget;

        if (shouldRecalculateMovement) {
            // Start timing the camera movement calculations
            const movementCalcStartTime = performance.now();

            // Calculate distance between current camera position and target using faster math
            const dx = player.centerX - targetX;
            const dy = player.centerY - targetY;
            distanceToTarget = Math.sqrt(dx * dx + dy * dy);

            // Cache the distance for later use
            cachedCameraValues.distanceToTarget = distanceToTarget;

            // Define base interpolation factor based on camera mode and settings
            interpolationFactor = 1.0; // Default: Instant follow (factor of 1)

            // Calculate smooth factor based on user settings (smaller = smoother/slower)
            // Enhanced formula for smoother camera movement
            const SMOOTH_FACTOR = 8 / clientSettings.rCamDelay;

            // Apply different smoothing based on camera mode with enhanced logic
            if (player1.spectate) {
                // Spectate mode uses a fixed smooth factor
                interpolationFactor = 0.12; // Slightly increased for better responsiveness
            } else if (clientSettings.sCameraMode === 'mass') {
                // Enhanced mass-weighted mode with optimized calculations
                const cellCount = Object.keys(player.myCells).length;

                // Only calculate total mass if we have cells
                let totalMass = 0;
                if (cellCount > 0 && frameCounter % HEAVY_CALC_INTERVAL === 0) {
                    // Expensive calculation - only do it every few frames
                    totalMass = Object.values(player.myCells).reduce((sum, cell) => sum + cell.getMass(), 0);
                    cachedCameraValues.totalMass = totalMass;
                } else {
                    // Use cached value
                    totalMass = cachedCameraValues.totalMass || 0;
                }

                // Base factor adjusted by cell count
                const baseFactor = cellCount > 1 ? SMOOTH_FACTOR * 0.75 : SMOOTH_FACTOR;

                // Adjust factor based on total mass (larger mass = smoother camera)
                // Use lookup table or simplified calculation for better performance
                const massAdjustment = totalMass > 0 ? Math.min(0.3, Math.log10(totalMass) / 30) : 0;

                // Adjust factor based on distance to target (farther = faster camera)
                const distanceAdjustment = Math.min(0.2, distanceToTarget / 5000);

                // Apply adjustments
                interpolationFactor = baseFactor * (1 - massAdjustment + distanceAdjustment);
            } else if (clientSettings.sCameraMode === 'ultrasmooth') {
                // Ultra Smooth camera mode - enhanced interpolation for smoother movement
                // Use a much lower interpolation factor for extremely smooth camera movement

                // Calculate a very low base factor for ultra smooth mode
                const ultraSmoothFactor = SMOOTH_FACTOR * 0.3; // 70% smoother than default

                // Still adjust for distance to prevent extremely slow camera when far away
                const distanceAdjustment = Math.min(0.15, distanceToTarget / 8000);

                // Apply adjustments with emphasis on smoothness
                interpolationFactor = ultraSmoothFactor * (1 + distanceAdjustment);
            } else {
                // Default mode with distance-based adjustment
                // Farther distances get faster camera movement for better responsiveness
                const distanceAdjustment = Math.min(0.2, distanceToTarget / 5000);
                interpolationFactor = SMOOTH_FACTOR * (1 + distanceAdjustment);
            }

            // Cache the interpolation factor
            cachedCameraValues.interpolationFactor = interpolationFactor;
            cachedCameraValues.lastMovementUpdateFrame = frameCounter;

            // Calculate and store performance metrics
            const movementCalcEndTime = performance.now();
            cameraCalcDuration += (movementCalcEndTime - movementCalcStartTime);
        } else {
            // Use cached values when not recalculating
            interpolationFactor = cachedCameraValues.interpolationFactor;
            distanceToTarget = cachedCameraValues.distanceToTarget;
        }

        // Incorporate frame delta for time-based interpolation
        // Cap at 1.0 to prevent overshooting during lag spikes
        const effectiveMoveFactor = Math.min(interpolationFactor * delta * 10, 1.0);

        // Enhanced easing function for smoother camera movement
        // Use improved easing curve for more natural camera movement
        // Optimized version of easeOutCubic
        const t = effectiveMoveFactor;
        const oneMinusT = 1 - t;
        easeFactor = 1 - oneMinusT * oneMinusT * oneMinusT;

        // Cache the ease factor
        cachedCameraValues.easeFactor = easeFactor;

        // Check if player has recently switched (for smoother transitions)
        const currentTime = Date.now();
        const hasRecentlySwitched = player.lastSwitchTime && (currentTime - player.lastSwitchTime < 500);

        // Apply camera movement with enhanced easing for dual mode
        if (clientSettings.cDualMode) {
            if (dualmodeGlobalCamX == -1) {
                // First frame initialization
                dualmodeGlobalCamX = player.centerX + (targetX - player.centerX) * easeFactor;
                dualmodeGlobalCamY = player.centerY + (targetY - player.centerY) * easeFactor;
            } else {
                // Calculate distance between current dual camera and target using faster math
                const dualDx = dualmodeGlobalCamX - targetX;
                const dualDy = dualmodeGlobalCamY - targetY;
                const dualCamDistToTarget = Math.sqrt(dualDx * dualDx + dualDy * dualDy);

                // Adaptive smoothing based on distance
                // Farther distances get faster camera movement
                const adaptiveFactor = Math.min(1.0, easeFactor * (1 + dualCamDistToTarget / 5000));

                // Apply enhanced easing with adaptive factor
                dualmodeGlobalCamX += (targetX - dualmodeGlobalCamX) * adaptiveFactor;
                dualmodeGlobalCamY += (targetY - dualmodeGlobalCamY) * adaptiveFactor;
            }
        }

        // Apply camera movement with enhanced easing for normal mode
        if (hasRecentlySwitched) {
            // Smoother transition when switching players
            // Blend between previous position and new target
            const switchBlendFactor = Math.min(1.0, (currentTime - player.lastSwitchTime) / 500);
            const adjustedEaseFactor = easeFactor * switchBlendFactor;

            player.centerX += (targetX - player.centerX) * adjustedEaseFactor;
            player.centerY += (targetY - player.centerY) * adjustedEaseFactor;
        } else {
            // Normal camera movement with adaptive factor based on distance
            const adaptiveFactor = Math.min(1.0, easeFactor * (1 + distanceToTarget / 5000));

            player.centerX += (targetX - player.centerX) * adaptiveFactor;
            player.centerY += (targetY - player.centerY) * adaptiveFactor;
        }

        // Update previous camera position
        player.prevCenterX = player.centerX;
        player.prevCenterY = player.centerY;

        // Step 3: Apply Manual Zoom with improved smoothing

        // Performance optimization: Only recalculate zoom parameters every CAMERA_CALC_INTERVAL frames
        // or when there's a significant change in the game state
        const shouldRecalculateZoom =
            frameCounter % CAMERA_CALC_INTERVAL === 0 ||
            cachedCameraValues.lastZoomUpdateFrame === -1 ||
            Math.abs(player.scale_base - cachedCameraValues.lastScaleBase) > 0.01;

        let desiredScale;

        if (shouldRecalculateZoom) {
            // Start timing the zoom calculations
            const zoomCalcStartTime = performance.now();

            // Cache the current scale base for change detection
            cachedCameraValues.lastScaleBase = player.scale_base;

            // Base desired scale
            desiredScale = player.scale_base * player.mouseZoom;

            // Enhanced dual mode zoom calculation
            if (clientSettings.cDualMode) {

                    // Calculate distance between players for dynamic zoom in dual mode
                    const inactPlayer = getActivePlayer() == player1 ? player2 : player1;

                    // Only perform this calculation if the inactive player has cells
                    if (inactPlayer && Object.keys(inactPlayer.myCells).length > 0) {
                        // Optimize distance calculation
                        const dx = player.centerX - inactPlayer.centerX;
                        const dy = player.centerY - inactPlayer.centerY;
                        const playerDistance = Math.sqrt(dx*dx + dy*dy);

                        // Cache the player distance
                        cachedCameraValues.playerDistance = playerDistance;

                        // Adjust zoom based on player separation
                        // Further apart = more zoomed out
                        // Use a more efficient calculation for the distance scale
                        const distanceScale = Math.max(1.0, Math.log10(playerDistance / 1000 + 1) * 0.5);
                        desiredScale = player.scale_base * player.mouseZoom / distanceScale;
                    }
                }


            // Cache the calculated desired scale
            cachedCameraValues.desiredScale = desiredScale;
            cachedCameraValues.lastZoomUpdateFrame = frameCounter;

            // Calculate and store performance metrics
            const zoomCalcEndTime = performance.now();
            cameraCalcDuration += (zoomCalcEndTime - zoomCalcStartTime);
        } else {
            // Use cached values when not recalculating
            desiredScale = cachedCameraValues.desiredScale;
        }

        // Enhanced dynamic zoom smoothing
        // Larger zoom changes = slower transitions for comfort
        // Smaller zoom changes = faster transitions for responsiveness
        const zoomDifference = Math.abs(desiredScale - player.scale) / player.scale;
        const dynamicZoomFactor = CAMERA_ZOOM_FACTOR * (1 - Math.min(0.8, zoomDifference));

        // Calculate zoom ease factor based on delta time and dynamic factor
        // Use the already calculated easing function instead of calling a new one
        // This improves performance by reusing the existing calculation
        const zoomEaseFactor = Math.min(dynamicZoomFactor * delta * 10, 1.0) * easeFactor;

        // Apply zoom with the calculated ease factor
        player.scale += (desiredScale - player.scale) * zoomEaseFactor;

        if (!clientSettings.cDualMode) {
            gameContainer.scale.set(player.scale)
            gameContainer.pivot.set(player.centerX, player.centerY)
            // Use set
        } else {
            gameContainer.scale.set(player.scale)
            gameContainer.pivot.set(dualmodeGlobalCamX, dualmodeGlobalCamY)
            // Use set
        }
        // Update the scale and pivot of the main container.

        // If connected and the main UI is hidden, send mouse coordinates updates.
        if (player.isConnected() && isMainMenuHidden) {
            if (!player.mouseFrozen && !mousefix) {
                // Keep existing mouse freeze check

                // Apply linesplit logic using helper
                const [finalTargetX, finalTargetY] = lineSplitHelper.updateInGameLoop(player, mouseGameX, mouseGameY)

                // Calculate Distance and Send Packet
                const dxSend = finalTargetX - lastMouseSendCoords.x
                // Use the new global object
                const dySend = finalTargetY - lastMouseSendCoords.y
                const distSqSend = dxSend * dxSend + dySend * dySend

                if (distSqSend > MOUSE_MOVE_THRESHOLD_SQ) {
                    player.sendPacket(new network.sendMouse(finalTargetX, finalTargetY))
                    lastMouseSendCoords.x = finalTargetX
                    // Update last sent object
                    lastMouseSendCoords.y = finalTargetY
                }
            }
        }

        // Custom functions

        motherShips(mouseGameX, mouseGameY)
        MouseFollow(mouseGameX, mouseGameY)

        frameCounter++
        if (!clientSettings.cHideMinimap && frameCounter % MINIMAP_UPDATE_INTERVAL === 0) {
            updateMinimap(delta * MINIMAP_UPDATE_INTERVAL)
        }

        hideUIElements()

        // Update any buffered objects and render the scene.
        player1.buffHolder.update()
        player2.buffHolder.update()
        app.renderer.render(app.stage)

        fpsCounter++
        // Every second, update the FPS display and server reset/respawn info.
        if (accumulatedTime >= 1000) {
            hudElements.playerFps.innerHTML = fpsCounter
            hudElements.playerFps2.innerHTML = fpsCounter

            // hudElements.playerFps.innerHTML = fpsCounter;
            // hudElements.playerFps2.innerHTML = fpsCounter;
            var _0x112EB = Date.now()
            if (player1.serverData.resetType > 0 && player1.serverData.resetTime > 0) {
                hudElements.resetInfo.css("display", "block")
                var _0x112BD = Math.max(0, Math.floor((player1.serverData.resetTime - _0x112EB) / 1e3))
                hudElements.resetTime.html(formatAliveTime(_0x112BD))
            } else {
                hudElements.resetInfo.css("display", "none")
            }
            if (player1.respawnCooldown > 0 && player1.respawnCooldown >= _0x112EB) {
                hudElements.respawnInfo.css("display", "block")
                var _0x112BD = Math.max(0, Math.ceil((player1.respawnCooldown - _0x112EB) / 1e3))
                hudElements.respawnCooldown.html(formatAliveTime(_0x112BD))
            } else {
                if (player1.respawnCooldown < 0) {
                    hudElements.respawnInfo.css("display", "block")
                    hudElements.respawnCooldown.html("NEVER")
                } else {
                    hudElements.respawnInfo.css("display", "none")
                }
            }
            if (clientSettings.cShowCoordinates) {
                updateCoordinates()
            }

            accumulatedTime = 0
            fpsCounter = 0
        }

        //  YF(quickSplitEnabled, targetPlayerName)
        // createOrUpdateUI();

        // Update the registry of players.
        player1.playerRegistry.handleUpdatedPlayers()
        player2.playerRegistry.handleUpdatedPlayers()

        animationFrameId = requestAnimationFrame(gameLoop)
    }

    /**
     * Draw or remove the game border based on settings
     */
    function drawGameBorder() {
        if (clientSettings.cShowBorder && player1.serverData.border.enabled) {
            // If a previous border graphic exists AND is still on the stage, remove and destroy it.
            if (borderGraphic != null && borderGraphic.parent) {
                borderGraphic.parent.removeChild(borderGraphic)
                borderGraphic.destroy()
                borderGraphic = null
                // Clear the reference after destroying
            }

            // Create a new PIXI Graphics object for the border.
            borderGraphic = new PIXI.Graphics()

            // Set the line style using the configured border size and color.
            borderGraphic.lineStyle(uiTheme.rBorderSize, PIXI.utils.string2hex(tinycolor(uiTheme.uiGameBorderColor).toHexString()))
            // Draw a rectangle using the server's border parameters.
            borderGraphic.drawRect(player1.serverData.border.left, player1.serverData.border.top, player1.serverData.border.width, player1.serverData.border.height)

            // Add the border to the border container
            borderContainer.addChild(borderGraphic)
            borderGraphic.visible = true
        } else {
            // Otherwise, if a border graphic exists, remove and destroy it.
            if (borderGraphic != null && borderGraphic.parent) {
                borderGraphic.parent.removeChild(borderGraphic)
                borderGraphic.destroy()
                borderGraphic = null
            }
        }
    }
    function updateCoordinates() {
        hudElements.minimapCoords.css({
            color: "#FFFFFF"
        })
        hudElements.minimapCoords.html("X: " + player1.centerX.toFixed(0) + " Y: " + player1.centerY.toFixed(0))
    }
    /**
     * Determines if a player is a threat based on size and distance
     * @param {Object} activePlayer - The active player (player1 or player2)
     * @param {Object} otherPlayer - The player to check if they're a threat
     * @returns {Object} - Threat information {isThreat, threatLevel, color}
     */
    function isThreatToPlayer(activePlayer, otherPlayer) {
        // Skip if the player is the active player or doesn't have position/size
        if (!otherPlayer || !otherPlayer.x || !otherPlayer.y || !otherPlayer.size) {
            return {
                isThreat: false,
                threatLevel: 0,
                color: "#ffffff"
            }
        }

        // Calculate the total mass of the active player
        let activeMass = 0
        let biggestCellMass = 0

        for (const cellId in activePlayer.myCells) {
            const cell = activePlayer.myCells[cellId]
            const cellMass = cell.getRealMass()
            activeMass += cellMass

            // Track the biggest cell's mass
            if (cellMass > biggestCellMass) {
                biggestCellMass = cellMass
            }
        }

        // If player has no cells, they can't be threatened
        if (activeMass === 0) {
            return {
                isThreat: false,
                threatLevel: 0,
                color: "#ffffff"
            }
        }

        // Calculate the mass of the other player
        const otherMass = otherPlayer.getRealMass ? otherPlayer.getRealMass() : Math.pow(otherPlayer.size, 2) / 25

        // Calculate distance between players
        const distance = Math.sqrt(Math.pow(activePlayer.centerX - otherPlayer.x, 2) + Math.pow(activePlayer.centerY - otherPlayer.y, 2))

        // Calculate the split reach of the other player
        // This is an approximation - adjust as needed
        const splitReach = otherPlayer.size * 4

        // Determine threat level
        let threatLevel = 0
        let color = "#ffffff"
        let isThreat = false

        // If other player is bigger than our biggest cell and within split range
        if (otherMass > biggestCellMass * 1.25 && distance < splitReach) {
            isThreat = true
            threatLevel = 3
            // High threat - can split and eat us
            color = "#ff0000"
            // Red
        }
        /* // If other player is bigger than our total mass
           else if (otherMass > activeMass * 1.1) {
               isThreat = true;
               threatLevel = 2; // Medium threat - bigger than us
               color = "#ff9900"; // Orange
           }
           // If other player is close to our size (within 90%)
           else if (otherMass > activeMass * 0.9) {
               isThreat = true;
               threatLevel = 1; // Low threat - similar size
               color = "#ffff00"; // Yellow
           }

           */

        return {
            isThreat,
            threatLevel,
            color
        }
    }

    /**
     * Updates the minimap party member positions and labels.
     * The parameter 'delta' is the normalized elapsed time for smooth interpolation.
     */
    function updateMinimap(delta) {
        // Only update if the server has border data enabled.
        if (!player1.serverData.border.enabled) {
            return
        }

        minimapContext.clearRect(0, 0, minimap_canvas.width, minimap_canvas.height)
        minimapContext.font = "12px Calibri"

        const activePlayer = getActivePlayer()

        if (clientSettings.cShowChunks) {
            var _0x11205 = (activePlayer.centerX - player1.serverData.border.left) / player1.serverData.border.width
            var _0x1121C = (activePlayer.centerY - player1.serverData.border.top) / player1.serverData.border.height
            var ChunkW = minimap_canvas.width / 5
            var ChunkH = minimap_canvas.height / 5
            for (var i = 0; i < 5; i++) {
                for (var j = 0; j < 5; j++) {
                    if (Math.floor(_0x11205 * 5) == i && Math.floor(_0x1121C * 5) == j) {
                        minimapContext.fillStyle = "#AAAA0040"
                        minimapContext.fillRect(i * ChunkW, j * ChunkH, ChunkW, ChunkH)
                    }
                    minimapContext.fillStyle = "white"
                    minimapContext.fillText(MINIMAP_COLUMN_TEXT[i] + MINIMAP_ROW_TEXT[j], (0.5 + i) * ChunkW - 6, (0.5 + j) * ChunkH + 4)
                }
            }
        }

        // Draw party members
        for (var i = 0; i < player1.party.length; i++) {
            var partyMember = player1.party[i]
            if (partyMember.state === PlayerState.ALIVE && partyMember.id != player1.playerId && partyMember.id != player2.playerId) {
                minimapDrawPlayer(
                    minimapContext,
                    partyMember.name,
                    partyMember.x,
                    partyMember.y,
                    4,
                    4, // font size scale or padding
                    partyMember.mmColor,
                    true // flag indicating it's a party member label
                )
                // Smoothly interpolate the party member's position.
                partyMember.x += (partyMember.x_ - partyMember.x) * delta
                partyMember.y += (partyMember.y_ - partyMember.y) * delta
            }
        }

        // Draw the current player's label on the minimap.

        minimapDrawPlayer(
            minimapContext,
            player1.name,
            player1.centerX,
            player1.centerY,
            6, // a slightly larger label
            "#fefefe",
            false
        )

        if (player2.isConnected()) {
            minimapDrawPlayer(minimapContext, player2.name, player2.centerX, player2.centerY, 6, '#fefefe', false);
        }

        minimapDrawPlayer(minimapContext, activePlayer.name, activePlayer.centerX, activePlayer.centerY, 8, '#9b3ff180', false);

        const timestamp = Date.now() * 0.001;
        for (var i = 0; i < onScreenIcons.length; i++) {
            var icons = onScreenIcons[i];
            minimapDrawMarker(minimapContext, icons.icon, icons.text, icons.x, icons.y, icons.party, icons.color, icons.opacity);
            icons.opacity -= (timestamp - icons.lasttime) * 0.4;
            icons.lasttime = timestamp;
            onScreenIcons = onScreenIcons.filter(icons => icons.opacity > 0);
        }

        // Draw threat indicators for other players if enabled
        if (clientSettings.cShowThreatIndicators) {
            //const activePlayer = getActivePlayer();
            if (activePlayer && activePlayer.bucket) {
                // Iterate through all players in the bucket
                for (const [_, player] of activePlayer.bucket.entries()) {
                    // Skip party members, self, and player2
                    if (player.playerId === activePlayer.playerId || (player2.isConnected() && player.playerId === player2.playerId)) {
                        continue
                    }

                    // Check if player is in a party
                    let isPartyMember = false
                    for (var i = 0; i < activePlayer.party.length; i++) {
                        if (activePlayer.party[i].id === player.playerId) {
                            isPartyMember = true
                            break
                        }
                    }
                    if (isPartyMember) continue

                    // Check if player is a threat
                    const threatInfo = isThreatToPlayer(activePlayer, player)

                    if (threatInfo.isThreat) {
                        // Draw threat indicator on minimap
                        const threatSize = 4 + threatInfo.threatLevel
                        // Size based on threat level

                        // Draw a triangle for threats
                        const x = ((player.x - activePlayer.serverData.border.left) / activePlayer.serverData.border.width) * minimap_canvas.width
                        const y = ((player.y - activePlayer.serverData.border.top) / activePlayer.serverData.border.height) * minimap_canvas.height

                        minimapContext.beginPath()
                        minimapContext.moveTo(x, y - threatSize)
                        minimapContext.lineTo(x + threatSize, y + threatSize)
                        minimapContext.lineTo(x - threatSize, y + threatSize)
                        minimapContext.closePath()

                        minimapContext.fillStyle = threatInfo.color
                        minimapContext.fill()
                    }
                }
            }
        }
    }
    /**
     * Save user settings wrapper function
     */
    function saveSettings() {
        saveUserSettings()
    }

    /**
     * Constructor for the second player's game client
     */
    function PlayerTwoClient() {
        this.centerXs = 0x0
        this.centerYs = 0x0
        this.socket = null
        this.currentServer = null
        this.currentServerName = null
        this.spectate = false
        this.name = ""
        this.enabled = ![]
        this.playerId = 0
        this.calculatedMouseY = 0
        this.calculatedMouseX = 0
        this.bucket = new Map()
        this.foodObjects = new Map()
        this.myCells = {}
        this.playerRegistry = new PlayerRegistry()
        this.buffHolder = new buff_holder()
        this.centerX = 0
        this.centerY = 0
        this.centerX_ = 0
        this.prevCenterX = 0
        this.prevCenterY = 0
        this.centerY_ = 0
        this.isLineSplitting = false
        // Tracks if linesplit is ON
        this.lineSplitAnchorX = 0
        // X position of the anchor (e.g., biggest cell) when activated
        this.lineSplitAnchorY = 0
        // Y position of the anchor
        this.lineSplitAxis = null
        // Locked axis ('x', 'y', or null if not locked yet)
        this.centerSteps = 0
        this.scale = 0.5
        this.scale_ = 0.5
        this.scale_base = 0.5
        this.mouseZoom = 1
        this.offsetX = 0
        this.offsetY = 0
        this.mouseRawX = 0
        this.mouseRawY = 0
        this.mouseX = 0
        this.mouseY = 0
        this.mouseFrozen = false
        this.party = []
        this.partyIds = {}
        this.subPanelOverride = false
        this.serverData = {
            hasSentSubPanel: false,
            border: {},
            maxCells: 16
        }
        this.score = 0
        this.respawnCooldown = 0
        this.customGameMap = null
        this.accountListeners = {}
        this.isConnecting = false // Flag to prevent multiple connection attempts

        this.clearStats()
        setInterval(this.sendPing.bind(this), 3e4)
    }

    /**
     * Send split command to the server
     * @param {number} splitCount - Number of split commands to send
     */
    PlayerTwoClient.prototype.sendSplit = function (splitCount) {
        console.log(`[GameClient ${this.playerId || "N/A"}] Sending ${splitCount} split commands.`)
        const splitPacket = network.sendKey(17)
        // 17 is the split key code
        for (let i = 0; i < splitCount; i++) {
            this.sendPacket(splitPacket)
        }
        // If sound player exists:
        // soundPlayer.playSound('split');
    }

    /**
     * Gets the count of player cells
     * @returns {number} The number of cells the player has
     */
    PlayerTwoClient.prototype.getMass = function () {
        var totalMass = 0
        var cellCount = 0

        // Count cells and sum their masses
        for (var cellId in this.myCells) {
            var cell = this.myCells[cellId]
            totalMass += cell.getRealMass()
            cellCount++
        }

        // Return the cell count (not the mass despite the function name)
        return cellCount
    }

    /**
     * Reset player statistics to default values
     */
    PlayerTwoClient.prototype.clearStats = function () {
        this.stats = {
            name: "An unnamed cell",
            alive: 0,
            eatenFood: 0,
            eatenEject: 0,
            eatenVirus: 0,
            eatenPlayer: 0,
            gainFood: 0,
            gainEject: 0,
            gainVirus: 0,
            gainPlayer: 0
        }
    }
    /**
     * Start playing the game
     */
    PlayerTwoClient.prototype.play = function () {
        // Prevent triggering play if already connecting
        if (this.isConnecting) {
            console.log("Player 2 is already connecting, ignoring play request.") // Optional log
            return
        }

        if (selectedServer == null) {
            this.selfMsg("No server selected!")
            return
        }

        this.name = $("#name-box2").val()
        this.spectate = false
        this.currentServerName = selectedServer.name
        scorePanelTwo.querySelector("#p2Server span").innerHTML = this.currentServerName
        hideMainMenu()

        if (this.isConnected() && this.currentServer == selectedServer.ip) {
            this.sendPacket(new network.setName(this.name))
        } else {
            // Set flag to prevent re-entry during delay
            this.isConnecting = true
            console.log("Player 2 connection delay started (20s)...") // Optional log
            showCountdownNotification(30) // Show 20s countdown

            setTimeout(() => {
                try {
                    this.connect(selectedServer.ip)
                } finally {
                    // Reset flag whether connect succeeds or throws
                    this.isConnecting = false
                    console.log("Player 2 connection delay finished.") // Optional log
                }
            }, 30000) // 20 seconds delay
        }

        showHudElements()
        showGameUI(mainUI)
    }
    /**
     * Enter spectate mode
     */
    PlayerTwoClient.prototype.spec = function () {
        if (selectedServer == null) {
            this.selfMsg("No server selected!")
            return
        }

        this.spectate = true
        hideMainMenu()

        if (this.isConnected() && this.currentServer == selectedServer.ip) {
            this.sendPacket(new network.sendSpectate())
        } else {
            this.connect(selectedServer.ip)
        }

        showHudElements()
        showGameUI(mainUI)
    }
    PlayerTwoClient.prototype.connect = function (_0x111EE) {
        if (this.socket != null) {
            this.socket.nextUrl = _0x111EE
            this.disconnect(_0x111EE)
            return
        }
        this.currentServer = _0x111EE
        this.currentServerName = selectedServer.name
        this.selfMsg("Connecting to " + (clientSettings.cHideServer ? "***Hidden***" : this.currentServerName))
        if (selectedServer.ssl == 1) {
            this.socket = new WebSocket("wss://" + _0x111EE)
        } else {
            this.socket = new WebSocket("ws://" + _0x111EE)
        }
        this.socket.binaryType = "arraybuffer"
        var _0x111D7 = this
        this.socket.onopen = this.onConnect.bind(this)
        this.socket.onmessage = this.onMessage.bind(this)
        this.socket.onclose = function (_0x111EE) {
            _0x111D7.reset()
            _0x111D7.selfMsg("You have been disconnected from the server. Reason: " + (_0x111EE.reason === "" ? "Unknown" : _0x111EE.reason))
            if (this.nextUrl != null) {
                _0x111D7.connect(this.nextUrl)
            }
        }
        this.socket.onerror = function (_0x11205) {
            // Suppressed WebSocket error handler 1
        }
        document.body.classList.add("hide-captcha-badge")
    }
    PlayerTwoClient.prototype.disconnect = function (_0x111D7) {
        if (this.socket != null) {
            this.socket.close()
        }
    }
    PlayerTwoClient.prototype.clearBuckets = function () {
        for (const cell of this.bucket.values()) {
            // Iterate over values
            cell.onDelete()
        }
        this.bucket.clear()
        // Clear the map efficiently

        for (const food of this.foodObjects.values()) {
            // Iterate over values
            food.onDelete()
        }
        this.foodObjects.clear()
        // Clear the map efficiently
    }
    PlayerTwoClient.prototype.reset = function () {
        this.clearBuckets()
        this.myCells = {}
        this.playerRegistry.clear()
        this.playerId = 0
        this.score = 0
        this.respawnCooldown = 0
        this.customGameMap = null
        this.currentServer = null
        this.clearStats()
        this.clearParty()
        this.buffHolder.clearBuffs()
        lineSplitHelper.handlePlayerDeathOrDisconnect()
        // Add this line
        this.serverData.hasSentSubPanel = false
        this.serverData.resetType = 0
        this.serverData.autosplits = false
        // *** FIX 3: Explicitly remove and clear the border graphic ***
        if (borderGraphic != null && borderGraphic.parent) {
            borderGraphic.parent.removeChild(borderGraphic)
            borderGraphic.destroy()
            borderGraphic = null
        }
        // Also reset the border enabled flag in serverData
        this.serverData.border.enabled = false
        // Add this line if not already resetting border data

        if (this.socket != null) {
            this.socket = null
        }
        scorePanelTwo.querySelector("#p2Id span").innerHTML = this.playerId
        if (this.subPanelOverride) {
            this.subPanelOverride = false
            _0x127F1()
        }

        manageInvitePlayer2Button()
    }
    PlayerTwoClient.prototype.handleKey = function (_0x111EE) {
        if (_0x111EE == activeKeybinds.kEjectMass) {
            _0x12836 = true
            this.sendPacket(new network.sendEjectMass(true))
            return
        }

        if (_0x111EE == activeKeybinds.kSplit) {
            if (lineSplitHelper.canSplitNow(1)) return
            this.sendSplit(1)
            return
        }

        if (_0x111EE == activeKeybinds.kToggleSpec) {
            this.sendPacket(new network.sendKey(18))
            return
        }

        if (_0x111EE == activeKeybinds.kDoubleSplit) {
            if (lineSplitHelper.canSplitNow(2)) return
            this.sendSplit(2)
            return
        }

        if (_0x111EE == activeKeybinds.kTripleSplit) {
            if (lineSplitHelper.canSplitNow(3)) return
            this.sendSplit(3)
            return
        }

        if (_0x111EE == activeKeybinds.kQuadSplit) {
            if (lineSplitHelper.canSplitNow(4)) return
            this.sendSplit(4)
            return
        }

        if (_0x111EE == activeKeybinds.kHexaSplit) {
            if (lineSplitHelper.canSplitNow(6)) return
            this.sendSplit(6)
            return
        }

        if (_0x111EE == activeKeybinds.k32xSplit) {
            if (lineSplitHelper.canSplitNow(5)) return
            this.sendSplit(5)
            return
        }

        if (_0x111EE == activeKeybinds.k128xSplit) {
            if (lineSplitHelper.canSplitNow(7)) return
            this.sendSplit(7)
            return
        }

        if (_0x111EE == activeKeybinds.k256xSplit) {
            if (lineSplitHelper.canSplitNow(8)) return
            this.sendSplit(8)
            return
        }

        if (_0x111EE == activeKeybinds.kMultiSplit) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer && typeof inactivePlayer.sendSplit === "function") {
                inactivePlayer.sendSplit(1)
            }
            return
        }

        if (_0x111EE == activeKeybinds.kMultiDouble) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer && typeof inactivePlayer.sendSplit === "function") {
                inactivePlayer.sendSplit(2)
            }
            return
        }

        if (_0x111EE == activeKeybinds.kMultiMax) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer && typeof inactivePlayer.sendSplit === "function") {
                inactivePlayer.sendSplit(8)
            }
            return
        }

        if (_0x111EE == activeKeybinds.kMultiEject) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer) {
                // Use the same approach as the active player's eject mass
                inactivePlayer.sendPacket(new network.sendEjectMass(true))
            }
            return
        }

        if (_0x111EE == 38) {
            this.mouseZoom *= 1.05
            this.mouseZoom =
                player1.mouseZoom > 5 ? 5
                    : this.mouseZoom < 0.1 ? 0.1
                        : this.mouseZoom
            return
        }

        if (_0x111EE == 40) {
            this.mouseZoom *= 0.95
            this.mouseZoom =
                player1.mouseZoom > 5 ? 5
                    : this.mouseZoom < 0.1 ? 0.1
                        : this.mouseZoom
            return
        }

        if (_0x111EE == keyMappings.kFreezeMouse) {
            this.mouseFrozen = !this.mouseFrozen

            // Use the correct element IDs from the HTML
            const pMouseElement = document.getElementById("pMouse")
            const p2MouseElement = document.getElementById("p2Mouse")

            if (player1.mouseFrozen) {
                pMouseElement.classList.remove("d-none")
            } else {
                pMouseElement.classList.add("d-none")
            }

            if (player2.mouseFrozen) {
                p2MouseElement.classList.remove("d-none")
            } else {
                p2MouseElement.classList.add("d-none")
            }
            return
        }

        if (_0x111EE == activeKeybinds.kContextMenu) {
            _0x1156F()
            return
        }
    }

    PlayerTwoClient.prototype.isConnected = function () {
        if (this.socket == null) {
            return false
        } else {
            return this.socket.readyState == 1
        }
    }
    PlayerTwoClient.prototype.sendPacket = function (_0x111D7) {
        if (this.isConnected()) {
            this.socket.send(_0x111D7)
        }
    }
    PlayerTwoClient.prototype.onConnect = function () {
        chatCommands = []
        _0x118C2()

        this.sendPacket(new network.connectionStart())
        this.sendPing()
        this.sendOptions2()

        if (fb_app2.auth().currentUser !== null) {
            console.log("onConnect: Firebase user(2) found, attempting to send Firebase token...")
            fb_app2
                .auth()
                .currentUser.getIdToken(true)
                .then((_0x111D7_firebaseToken) => {
                    // NOTE: This sends the FIREBASE token, not the backend JWT
                    console.log("onConnect: Sending Firebase auth token(2) via packet.")
                    this.sendPacket(new network.sendAuthToken(_0x111D7_firebaseToken))
                })
                .catch((_0x111C0_firebaseError) => {
                    console.error("onConnect: Error getting Firebase token(2):", _0x111C0_firebaseError)
                    // Decide if failure here should also disconnect
                    // return _0x11AEA(_0x111C0_firebaseError, true); // Assuming _0x11AEA handles errors
                })
            // return; // Original code had return here, keep if intended
        } else {
            console.log("onConnect: No Firebase user(2). Sending name/spectate command.")
            if (!this.spectate) {
                this.sendPacket(new network.setName(this.name))
            } else {
                this.sendPacket(new network.sendSpectate())
            }

            testing = false
        }
        /*if (fb_app2.auth().currentUser !== null) {
              fb_app2.auth().currentUser.getIdToken(true).then(_0x111D7 => {
                  player2.sendPacket(new network.sendAuthToken(_0x111D7));
              }).catch(_0x111C0 => {
                  return _0x11AEA(_0x111C0, true);
              });
              return;
          } else {
              if (!this.spectate) {
                  this.sendPacket(new network.setName(this.name));
              } else {
                  this.sendPacket(new network.sendSpectate);
              }
          }         old code*/
    }
    PlayerTwoClient.prototype.sendPing = function () {
        if (this.isConnected()) {
            ping2 = +new Date()
            this.sendPacket(new network.sendPing())
        }
    }
    PlayerTwoClient.prototype.sendOptions2 = function () {
        if (this.isConnected()) {
            this.sendPacket(new network.sendOptions2())
        }
    }
    /**
     * Display a system message in the chat
     * @param {string} message - The message to display
     */
    PlayerTwoClient.prototype.selfMsg = function (message) {
        var messageCell = document.createElement("td")
        var messageSpan = document.createElement("span")
        messageSpan.style.color = "#9b3ff1"
        messageSpan.innerHTML = "[System] " + message.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        messageCell.appendChild(messageSpan)
        addChatMessage(ChatTabFlags.SYSTEM, messageCell)
    }
    /**
     * Display a system message with a selectable join code
     * @param {string} message - The message to display
     * @param {string} joinCode - The join code to display (selectable)
     */
    PlayerTwoClient.prototype.selfMsgWithJoinCode = function (message, joinCode) {
        var messageCell = document.createElement("td")
        var messageSpan = document.createElement("span")
        messageSpan.style.color = "#9b3ff1"
        messageSpan.innerHTML = "[System] " + message.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        messageCell.appendChild(messageSpan)
        var codeSpan = document.createElement("span")
        codeSpan.style.color = "#9b3ff1"
        codeSpan.innerHTML = joinCode
        codeSpan.style.pointerEvents = "all"
        codeSpan.style.userSelect = "all"
        messageCell.appendChild(codeSpan)
        addChatMessage(ChatTabFlags.SYSTEM, messageCell)
    }
    PlayerTwoClient.prototype.clearParty = function (_0x111D7) {
        this.party = []
        this.partyIds = {}
        this.partyLeader = -1
        this.partyIndex = -1
        partyPanel.css("display", "none")
        if (scrimmageCustom.css("display") == "block") {
            this.handleCustomGameLeave()
        }
        if (this.partyCode != null || partyCodeVariable != null) {
            this.partyCode = partyCodeVariable = null
            window.history.pushState("page", "", " ")
        }
    }
    PlayerTwoClient.prototype.isPartyLeader = function () {
        return this.partyLeader == this.playerId
    }
    PlayerTwoClient.prototype.getServerMaxCells = function () {
        return this.serverData.maxCells + this.buffHolder.bonusMaxCells
    }
    PlayerTwoClient.prototype.onMessage = function (_0x111EE) {
        var _0x111D7 = new DataView(_0x111EE.data)
        var _0x11205 = _0x111D7.getUint8(0)
        _0x111D7.offset = 1
        switch (_0x11205) {
            case 2:
                this.handleUpdate(_0x111D7)
                break
            case 10:
                break
            case 21:
                break
            case 22:
                break
            case 23:
                break
            case 40:
                this.handleInvite(_0x111D7)
                break
            case 41:
              //  this.handlePartyInfo(_0x111D7)
                break
            case 45:
                this.handlePartyData(_0x111D7)
                break
            case 43:
                this.handlePartyJoinCode(_0x111D7)
                break
            case 0x47:
                //this.handlePing();
                break
            case 0x49:
                this.handleWhisper(_0x111D7)
                break
            case 50:
                break
            case 63:
                break
            case 64:
                this.handleMapData(_0x111D7)
                break
            case 65:
                break
            case 66:
                break
            case 68:
                break
            case 69:
                break
            case 70:
                break
            case 71:
                break
            case 72:
                break
            case 73:
                break
            case 74:
                break
            case 80:
                break
            case 81:
                break
            case 82:
                break
            case 83:
                break
            case 90:
                break
            case 91:
                break
            case 92:
                break
            case 93:
                break
            case 94:
                break
            case 100:
                this.handleAddBuff(_0x111D7)
                break
            case 101:
                this.handleRemoveBuff(_0x111D7)
                break
            case 102:
                this.handleClearBuffs(_0x111D7)
                break
            case 103:
                break
            case 104:
                break
        }
    }

    PlayerTwoClient.prototype.handleUpdate = function (FM) {
        var Fn = FM.getUint16(FM.offset, !![])
        FM.offset += 0x2
        while (Fn > 0x0) {
            var Ff = FM.getUint16(FM.offset, !![])
            FM.offset += 0x2
            //  player2.playerRegistry.remove(Ff);
            player2.playerRegistry.remove(Ff)
            Fn--
        }
        Fn = FM.getUint16(FM.offset, !![])
        FM.offset += 0x2
        while (Fn > 0x0) {
            var Ff = FM.getUint16(FM.offset, !![])
            FM.offset += 0x2
            //  var Fb = this.bucket[Ff] || this.foodObjects[Ff];
            var Fb = this.bucket.get(Ff) || this.foodObjects.get(Ff)

            if (Fb != null) {
                if (Fb.type == 0x6) {
                    // Call onDelete to clean up visual elements
                    Fb.onDelete()
                    // delete this.foodObjects[Ff];
                    this.foodObjects.delete(Ff)
                } else {
                    // Call onDelete to clean up visual elements
                    Fb.onDelete()
                    //  delete this.bucket[Ff];
                    this.bucket.delete(Ff)
                }
                if (Fb.playerId == this.playerId) {
                    delete this.myCells[Ff]
                    if (Object.keys(this.myCells).length == 0x0) {
                        if (clientSettings.cAutoRespawn) {
                            if ($("#main").css("display") == "none") {
                                player2.play()
                            }
                        } else {
                            if (player1 && Object.keys(player1.myCells).length > 0x0) {
                                if(getActivePlayer()==player2)Fbs();
                            } else if (scrimmageMenu.css("display") != "block") {
                                mainMenuVisible = !mainMenuVisible
                                showUIElement(mainUI)
                            }
                            aiptag.cmd.display.push(function () {
                                aipDisplayTag.refresh("GOT_gota-io_336x280")
                            })
                        }
                    }
                }
                Fb.onDelete()
            }
            Fn--
        }
        while (!![]) {
            var Ff = FM.getUint16(FM.offset, !![])
            FM.offset += 0x2
            if (Ff == 0x0) {
                break
            }
            var Fh = this.playerRegistry.getPlayer(Ff)
            var Fr = ![]
            if (Fh == null) {
                Fh = new PlayerData(Ff)
            } else {
                Fr = !![]
            }
            Fh.cellColor = (FM.getUint8(FM.offset++) << 0x10) + (FM.getUint8(FM.offset++) << 0x8) + FM.getUint8(FM.offset++)
            Fh.name = _0x122E9(FM)
            Fh.setSkin(_0x12300(FM))
            Fh.setFlags(FM.getUint8(FM.offset++))
            if ((Fh.flags & 0x2) == 0x2) {
                Fh.nameColor = "#" + byteToHex(FM.getUint8(FM.offset++)) + byteToHex(FM.getUint8(FM.offset++)) + byteToHex(FM.getUint8(FM.offset++))
                Fh.parseEffect(FM.getUint8(FM.offset++))
                Fh.nameFont = FM.getUint8(FM.offset++)
            }
            if (!Fr) {
                player2.playerRegistry.add(Fh)
            } else {
                player2.playerRegistry.updatePlayer(Fh)
            }
        }
        while (!![]) {
            var FV = FM.getUint8(FM.offset++)
            var Fx = 0x0
            if (FV == 0x0) {
                break
            }
            while (!![]) {
                if (FV == 0x2 && Fx == 0x0) {
                    Fx = FM.getUint16(FM.offset, !![])
                    FM.offset += 0x2
                    if (Fx == 0x0) {
                        break
                    }
                }
                var Ff = FM.getUint16(FM.offset, !![])
                FM.offset += 0x2
                if (Ff == 0x0) {
                    if (FV == 0x2) {
                        Fx = 0x0
                        continue
                    } else {
                        break
                    }
                }
                var Fb = new GameCell(Ff, player2)
                Fb.setType(FV)
                Fb.setX(FM.getInt16(FM.offset, !![]))
                Fb.setY(FM.getInt16(FM.offset + 0x2, !![]))
                FM.offset += 0x4
                switch (FV) {
                    case 0x6:
                        Fb.color = _0x122A4[Fb.id % _0x122A4.length]
                        break
                    case 0x1:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        Fb.color = (FM.getUint8(FM.offset++) << 0x10) + (FM.getUint8(FM.offset++) << 0x8) + FM.getUint8(FM.offset++)
                        var FI = FM.getUint8(FM.offset++)
                        Fb.skin = (FI & 0x7f) - 0x1
                        Fb.rainbow = (FI & 0x80) == 0x80
                        break
                    case 0x2:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2

                        Fb.playerId = Fx

                        break
                    case 0x3:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        break
                    case 0x4:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        break
                    case 0x5:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        Fb.buff = FM.getUint8(FM.offset++)
                        break
                }
                Fb.onCreate(this)
            }
        }
        while (!![]) {
            var FV = FM.getUint8(FM.offset++)
            if (FV == 0x0) {
                break
            }
            while (!![]) {
                var Ff = FM.getUint16(FM.offset, !![])
                FM.offset += 0x2
                if (Ff == 0x0) {
                    break
                }
                var N0 = FM.getInt16(FM.offset, !![])
                var N1 = FM.getInt16(FM.offset + 0x2, !![])
                FM.offset += 0x4
                var Fb
                if (FV == 0x6) {
                    //    Fb = this.foodObjects[Ff];
                    Fb = this.foodObjects.get(Ff)
                } else {
                    //    Fb = this.bucket[Ff];
                    Fb = this.bucket.get(Ff)
                }
                if (Fb == null) {
                    Fb = new GameCell(Ff, player2)
                    Fb.setType(FV)
                    Fb.setSize(0xa)
                    Fb.setX(N0)
                    Fb.setY(N1)
                    Fb.onCreate(this)
                } else {
                    Fb.updateX(N0)
                    Fb.updateY(N1)
                }
                switch (FV) {
                    case 0x2:
                        Fb.size_ = FM.getUint16(FM.offset, !![])
                        FM.offset += 0x2
                        break
                    case 0x3:
                        Fb.size_ = FM.getUint16(FM.offset, !![])
                        FM.offset += 0x2
                        break
                    case 0x4:
                        Fb.size_ = FM.getUint16(FM.offset, !![])
                        FM.offset += 0x2
                        break
                }
                Fb.steps = 0x1e
            }
        }
        this.sortCells()
    }
    PlayerTwoClient.prototype.handlePosition = function (_0x111D7) {
        this.centerX_ = _0x111D7.getFloat32(_0x111D7.offset, true)
        _0x111D7.offset += 4
        this.centerY_ = _0x111D7.getFloat32(_0x111D7.offset, true)
        _0x111D7.offset += 4
        this.centerSteps = 30
        if (!clientSettings.cDisableAutoZoom && !clientSettings.cDualMode) {
            this.scale_base = _0x111D7.getFloat32(_0x111D7.offset, true)
        }
    }
    PlayerTwoClient.prototype.handleRespawnCooldown = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getFloat64(_0x111EE.offset, true)
        this.respawnCooldown = _0x111D7
    }
    PlayerTwoClient.prototype.handleMapData = function (_0x111D7) {
        this.playerId = _0x111D7.getUint16(_0x111D7.offset, true)
        _0x111D7.offset += 3
        this.handleUpdateBorder(_0x111D7)
        this.serverData.maxCells = _0x111D7.getUint16(_0x111D7.offset, true)
        _0x111D7.offset += 2
        _0x12300(_0x111D7)
        this.serverData.autosplits = _0x111D7.getUint8(_0x111D7.offset++)
        scorePanelTwo.querySelector("#p2Id span").innerHTML = this.playerId
        this.updateCellCounter(0, true)
        if (partyCodeVariable != null) {
            player2.sendPacket(new network.sendPartyJoin(partyCodeVariable))
        }
        scrimmageMenu.css("display", "none")
        $("#scrimmage-btn-leave").css("display", "none")

        manageInvitePlayer2Button()
    }
    PlayerTwoClient.prototype.handleUpdateBorder = function (_0x111D7) {
        this.serverData.border = {}
        this.serverData.border.left = _0x111D7.getInt16(_0x111D7.offset, true)
        this.serverData.border.top = _0x111D7.getInt16(_0x111D7.offset + 2, true)
        this.serverData.border.right = _0x111D7.getInt16(_0x111D7.offset + 4, true)
        this.serverData.border.bottom = _0x111D7.getInt16(_0x111D7.offset + 6, true)
        _0x111D7.offset += 8
        this.serverData.border.width = this.serverData.border.right - this.serverData.border.left
        this.serverData.border.height = this.serverData.border.bottom - this.serverData.border.top
        this.serverData.border.enabled = this.serverData.border.width != 0 && this.serverData.border.height != 0
        drawGameBorder()
    }
    PlayerTwoClient.prototype.handleResetTime = function (_0x11205) {
        var _0x111EE = _0x11205.getUint8(_0x11205.offset++)
        var _0x111D7 = _0x11205.getFloat64(_0x11205.offset, true)
        this.serverData.resetType = _0x111EE
        this.serverData.resetTime = _0x111D7
    }
    PlayerTwoClient.prototype.handleSpectators = function (_0x111D7) {
        this.spectators = _0x111D7.getUint16(_0x111D7.offset, true)
        this.updateSpectators()
    }
    PlayerTwoClient.prototype.handleClearNodes = function (_0x111D7) {
        this.clearBuckets()
    }
    PlayerTwoClient.prototype.handleLeaderboard = function (_0x11278) {
        var _0x11233 = document.getElementById("leaderboard-canvas")
        var _0x111EE = _0x11233.getContext("2d")
        leaderboardHeader.text("Leaderboard")
        var _0x111D7 = _0x11278.getUint32(_0x11278.offset, true)
        _0x11278.offset += 4
        _0x11233.width = 200
        _0x11233.height = 20 * _0x111D7 + 5
        _0x111EE.font = "16px Calibri"
        var _0x11261 = 20
        for (var _0x11205 = 0; _0x11205 < _0x111D7; _0x11205++) {
            var _0x1121C = _0x11278.getUint16(_0x11278.offset, true)
            _0x11278.offset += 2
            var _0x1124A = _0x122E9(_0x11278) || "An unnamed cell"
            if (_0x1121C == this.playerId) {
                _0x111EE.fillStyle = uiTheme.uiLeaderboardHighlightSelf
            } else {
                if (this.partyIds[_0x1121C] != null) {
                    _0x111EE.fillStyle = uiTheme.uiLeaderboardHighlightParty
                } else {
                    _0x111EE.fillStyle = uiTheme.uiForegroundColor
                }
            }
            _0x111EE.fillText(_0x11205 + 1 + ". " + _0x1124A, 10, _0x11261)
            _0x11261 += 20
        }
    }
    PlayerTwoClient.prototype.handleLeaderboardCustom = function (_0x1128F) {
        var _0x11233 = document.getElementById("leaderboard-canvas")
        var _0x11205 = _0x11233.getContext("2d")
        leaderboardHeader.html("Leaderboard")
        var _0x111D7 = _0x1128F.getUint16(_0x1128F.offset, true)
        var _0x111EE = _0x1128F.getUint8(_0x1128F.offset + 2, true)
        var _0x11278 = _0x1128F.getUint8(_0x1128F.offset + 3, true)
        _0x1128F.offset += 4
        _0x11233.width = 200
        _0x11233.height = 20 * _0x111D7 + 5
        _0x11205.font = "16px Calibri"
        var _0x11261 = 20
        for (var _0x1121C = 0; _0x1121C < _0x111D7; _0x1121C++) {
            var _0x1124A = _0x12300(_0x1128F)
            if (_0x1121C == _0x111EE) {
                _0x11205.fillStyle = uiTheme.uiLeaderboardHighlightSelf
            } else {
                _0x11205.fillStyle = uiTheme.uiForegroundColor
            }
            _0x11205.fillText(_0x1124A, 5, _0x11261)
            _0x11261 += 20
        }
    }
    PlayerTwoClient.prototype.handlePing = function () {
        var _0x111D7 = pingTimestamp
        if (!clientSettings.cColoredPing) {
            if (_0x111D7 < 100) {
                scorePanelTwo.querySelector("#p2Ping span").style.color = uiTheme.uiGameColorSuccess
            } else {
                if (_0x111D7 < 200) {
                    scorePanelTwo.querySelector("#p2Ping span").style.color = uiTheme.uiGameColorWarning
                } else {
                    scorePanelTwo.querySelector("#p2Ping span").style.color = uiTheme.uiGameColorError
                }
            }
        } else {
            scorePanelTwo.querySelector("#p2Ping span").style.color = uiTheme.uiForegroundColor
        }
        scorePanelTwo.querySelector("#p2Ping span").textContent = _0x111D7 + "ms"
        // Use
    }
    PlayerTwoClient.prototype.handleChat = function (_0x1135E) {
        var _0x111D7 = _0x1135E.getUint8(_0x1135E.offset++)
        var _0x112D4 = "rgb(" + _0x1135E.getUint8(_0x1135E.offset++) + "," + _0x1135E.getUint8(_0x1135E.offset++) + "," + _0x1135E.getUint8(_0x1135E.offset++) + ")"
        var _0x11205 = _0x1135E.getUint8(_0x1135E.offset++)
        var _0x11302 = _this.getPlayerById
        _0x1135E.offset += 2
        if (chatCommands.includes(_0x11302)) {
            return
        }
        var _0x11330 = _0x122E9(_0x1135E)
        _0x1135E.getUint8(_0x1135E.offset++)
        var _0x112A6 = _0x122E9(_0x1135E).replace(/</g, "&lt;").replace(/>/g, "&gt;") || "An unnamed cell"
        var _0x11278 = _0x122E9(_0x1135E).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        var _0x11233 = ChatTabFlags.ALL
        var _0x1128F = _0x1135E.offset < _0x1135E.byteLength ? _0x1135E.getBigInt64(_0x1135E.offset, true) : 0
        var _0x111EE
        switch (_0x111D7) {
            case 1:
                _0x111EE = "Party"
                _0x11233 = ChatTabFlags.PARTY
                break
            case 2:
                _0x111EE = "Admin"
                _0x11233 = ChatTabFlags.ADMIN
                break
            default:
                _0x111EE = "All"
                break
        }
        if (_0x11330.length > 0) {
            ; (_0x111EE += " - " + _0x11330).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }
        var _0x11261 = document.createElement("td")
        if (_0x1128F != 0) {
            _0x11261.dataset.msgid = _0x1128F
        }
        var _0x11319 = document.createElement("span")
        _0x11319.innerHTML = "[" + _0x111EE + "] "
        _0x11261.appendChild(_0x11319)
        var _0x112EB = document.createElement("span")
        _0x112EB.innerText = _0x112A6
        _0x112EB.dataset.playerId = _0x11302
        _0x112EB.style.color = _0x112D4
        _0x112EB.className = "chat-name"
        _0x112EB.oncontextmenu = onChatNameContextMenu
        _0x11261.appendChild(_0x112EB)
        var _0x1124A = document.createElement("span")
        _0x1124A.innerHTML = ": "
        _0x11261.appendChild(_0x1124A)
        var _0x11347 = document.createElement("span")
        _0x11347.className = "chat-content"
        _0x11347.style.color = _0x114A0[_0x11205]
        _0x11347.innerHTML = _0x120AA(_0x11278)
        _0x11261.appendChild(_0x11347)
        addChatMessage(_0x11233, _0x11261)
    }
    PlayerTwoClient.prototype.handleWhisper = function (_0x11319) {
        var _0x1128F = _0x122E9(_0x11319).replace(/</g, "&lt;").replace(/>/g, "&gt;") || "An unnamed cell"
        var _0x112D4 = _0x11319.getUint16(_0x11319.offset, true)
        _0x11319.offset += 2
        if (chatCommands.includes(_0x112D4)) {
            return
        }
        var _0x112A6 = "rgb(" + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + ")"
        var _0x11233 = _0x122E9(_0x11319).replace(/</g, "&lt;").replace(/>/g, "&gt;") || "An unnamed cell"
        var _0x11261 = _0x11319.getUint16(_0x11319.offset, true)
        _0x11319.offset += 2
        var _0x1124A = "rgb(" + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + ")"
        var _0x11205 = _0x122E9(_0x11319).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        var _0x111EE = document.createElement("td")
        var _0x112EB = document.createElement("span")
        _0x112EB.innerText = _0x1128F
        _0x112EB.dataset.playerId = _0x112D4
        _0x112EB.style.color = _0x112A6
        _0x112EB.className = "chat-name"
        _0x112EB.oncontextmenu = onChatNameContextMenu
        _0x111EE.appendChild(_0x112EB)
        var _0x111D7 = document.createElement("span")
        _0x111D7.innerHTML = " > "
        _0x111EE.appendChild(_0x111D7)
        var _0x11278 = document.createElement("span")
        _0x11278.innerText = _0x11233
        _0x11278.dataset.playerId = _0x11261
        _0x11278.style.color = _0x1124A
        _0x11278.className = "chat-name"
        _0x11278.oncontextmenu = onChatNameContextMenu
        _0x111EE.appendChild(_0x11278)
        var _0x11302 = document.createElement("span")
        _0x11302.innerHTML = ": " + _0x120AA(_0x11205)
        _0x111EE.appendChild(_0x11302)
        addChatMessage(ChatTabFlags.WHISPER, _0x111EE)
    }
    PlayerTwoClient.prototype.handleEditMessage = function (_0x11205) {
        var _0x111EE = _0x11205.getBigInt64(_0x11205.offset, true)
        _0x11205.offset += 8
        var _0x111D7 = _0x122E9(_0x11205).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        if (_0x111D7.length > 0) {
            $(".chat-table td[data-msgid='" + _0x111EE + "'] .chat-content").html(_0x120AA(_0x111D7))
        } else {
            $(".chat-table td[data-msgid='" + _0x111EE + "']")
                .closest("tr")
                .remove()
        }
    }
    PlayerTwoClient.prototype.handleSystemMsg = function (_0x111EE) {
        var _0x111D7 = _0x122E9(_0x111EE)
        this.selfMsg(_0x111D7)
    }
    PlayerTwoClient.prototype.handleAuthenticated = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(1)
        switch (_0x111D7) {
            case AuthenticatedResponse.SUCCESS:
                break
            case AuthenticatedResponse.FAILURE:
                this.selfMsg("Invalid authentication token! Please logout and try again!")
                break
        }
        if (!this.spectate) {
            this.sendPacket(new network.setName(this.name))
        } else {
            this.sendPacket(new network.sendSpectate())
        }
    }
    PlayerTwoClient.prototype.handleProfile = function (_0x11205) {
        var _0x111D7 = _0x12300(_0x11205)
        var _0x111EE = JSON.parse(_0x111D7)
        showAccountProfile(_0x111EE)
    }
    PlayerTwoClient.prototype.handleInvite = function (_0x11205) {
        if (clientSettings.cAutoDecline) {
            player1.sendPacket(new network.sendInviteResponse(false))
        } else {
            var _0x111EE = _0x122E9(_0x11205).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            var _0x111D7 = document.getElementById("popup-party-text")
            _0x111D7.innerText = _0x111EE + " has invited you to a party."
            showUIElement($("#popup-party"))
        }
    }
    PlayerTwoClient.prototype.handlePartyInfo = function (_0x1128F) {
        var _0x111D7 = _0x1128F.getUint16(_0x1128F.offset, true);
        _0x1128F.offset += 2;

        var _0x11233 = {};
        var _0x11261 = [];
        var _0x1124A = -1;

        for (var _0x11205 = 0; _0x11205 < _0x111D7; _0x11205++) {
            var _0x1121C = {
                id: _0x1128F.getUint16(_0x1128F.offset, true),
                isLeader: false,
                name: _0x122E9(_0x1128F) || 'An unnamed cell',
                x: 0,
                y: 0,
                x_: 0,
                y_: 0,
                score: 0,
                cache: -1,
                team: 0,
                state: PlayerState.UNKNOWN,
                mmColor: _0x122BB[_0x1121C.id % _0x122BB.length]
            };

            var _0x111EE = _0x1128F.getUint8(_0x1128F.offset++);
            _0x11233[_0x1121C.id] = _0x11205;
            _0x1128F.offset += 2;

            if (_0x111EE == 1) {
                _0x1124A = _0x1121C.id;
                _0x1121C.isLeader = true;
            }

            if (this.partyIds[_0x1121C.id] != null) {
                var _0x11278 = this.party[this.partyIds[_0x1121C.id]];
                _0x1121C.x = _0x11278.x;
                _0x1121C.y = _0x11278.y;
                _0x1121C.x_ = _0x11278.x_;
                _0x1121C.y_ = _0x11278.y_;
                _0x1121C.state = _0x11278.state;
                _0x1121C.score = _0x11278.score;
                _0x1121C.cache = _0x11278.cache;
            }

            _0x11261.push(_0x1121C);
        }

        this.party = _0x11261;
        this.partyIds = _0x11233;

        if (this.partyLeader != _0x1124A) {
            this.partyLeader = _0x1124A;
            if (scrimmageCustom.css('display') == 'block') {
                ScrimmageHelper.checkLeader();
            }
        }
    };
    PlayerTwoClient.prototype.handlePartyData = function (_0x1121C) {
        var _0x111D7 = _0x1121C.getUint16(_0x1121C.offset, true)
        _0x1121C.offset += 2
        if (_0x111D7 != this.party.length) {
            return
        }
        for (var _0x111EE = 0; _0x111EE < _0x111D7; _0x111EE++) {
            var _0x11205 = this.party[_0x111EE]
            _0x11205.state = _0x1121C.getUint8(_0x1121C.offset++)
            if (_0x11205.state === PlayerState.ALIVE) {
                _0x11205.x_ = _0x1121C.getInt16(_0x1121C.offset, true)
                _0x11205.y_ = _0x1121C.getInt16(_0x1121C.offset + 2, true)
                _0x11205.score = _0x1121C.getInt32(_0x1121C.offset + 4, true)
                _0x1121C.offset += 8
            }
        }
        // this.drawParty();
    }
    PlayerTwoClient.prototype.handlePartyJoinCode = function (_0x11205) {
        var _0x111D7 = _0x12300(_0x11205)
        this.partyCode = _0x12300(_0x11205)
        if (this.partyCode.length != 0) {
            this.selfMsgWithJoinCode(_0x111D7, this.partyCode)
            $("#popup-party-code-content input").val(this.partyCode)
            $("#popup-party-code").show()
            var _0x111EE = "#" + this.currentServerName + "&" + this.partyCode
            window.history.pushState("page", "", _0x111EE)
        } else {
            this.selfMsg(_0x111D7)
            this.partyCode = null
            window.history.pushState("page", "", " ")
        }
    }
    PlayerTwoClient.prototype.handleStats = function (_0x11205) {
        var _0x111D7 = _0x11205.getUint16(_0x11205.offset, true)
        _0x11205.offset += 2
        this.stats.name = _0x122E9(_0x11205) || "An unnamed cell"
        this.stats.alive += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenFood += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenEject += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenVirus += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenPlayer += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainFood += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainEject += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainVirus += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainPlayer += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        const statsElement = $("#main-stats")
        // Cache the selection once
        statsElement.empty()
        statsElement.append("<span>Name: " + this.stats.name + " (" + _0x111D7 + ")</span><br>")
        statsElement.append("<span>Alive: " + formatAliveTime(this.stats.alive) + "</span><br>")
        statsElement.append("<span>Food eaten: " + this.stats.eatenFood + " (" + this.stats.gainFood + ")</span><br>")
        statsElement.append("<span>Ejected mass eaten: " + this.stats.eatenEject + " (" + this.stats.gainEject + ")</span><br>")
        statsElement.append("<span>Viruses eaten: " + this.stats.eatenVirus + " (" + this.stats.gainVirus + ")</span><br>")
        statsElement.append("<span>Player cells eaten: " + this.stats.eatenPlayer + " (" + this.stats.gainPlayer + ")</span><br>")
    }
    PlayerTwoClient.prototype.showSubPanel = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(_0x111EE.offset++) == 1
        this.subPanelOverride = _0x111D7
        _0x127F1()
        if (_0x111D7) {
            if (!this.serverData.hasSentSubPanel) {
                _0x127DA()
                this.serverData.hasSentSubPanel = true
            }
            document.body.classList.add("hide-captcha-badge")
        }
    }
    PlayerTwoClient.prototype.updateSubPanel = function (_0x111D7) {
        if (globalUser2Data) {
            _0x11D6E(globalUser2Data.uid)
        }
    }
    PlayerTwoClient.prototype.updateSpectators = function () {
        hudElements.spectatorCount.text(this.spectators)
        // jQuery's .text() is equivalent to
    }
    PlayerTwoClient.prototype.handleAddBuff = function (_0x1121C) {
        var _0x111D7 = _0x1121C.getUint8(_0x1121C.offset++)
        var _0x11205 = _0x1121C.getUint8(_0x1121C.offset++)
        var _0x111EE = _0x1121C.getFloat64(_0x1121C.offset, true)
        _0x1121C.offset += 8
        this.buffHolder.onAddBuff(_0x111D7, _0x11205, _0x111EE)
    }
    PlayerTwoClient.prototype.handleRemoveBuff = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(_0x111EE.offset++)
        this.buffHolder.onRemoveBuff(_0x111D7)
    }
    PlayerTwoClient.prototype.handleClearBuffs = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(_0x111EE.offset++) == 1 ? true : false
        this.buffHolder.clearBuffs(_0x111D7)
    }
    /**
     * Sort cells by size
     */
    PlayerTwoClient.prototype.sortCells = function () {
        // Sort the cells in the cell container by size
        cellContainer.children.sort(function (cell1, cell2) {
            return cell1.parentCell.size - cell2.parentCell.size
        })
        this.updateScorePanel()
    }
    PlayerTwoClient.prototype.updateScorePanel = function () {
        var _0x111EE = 0
        var _0x111D7 = 0
        for (var _0x11205 in this.myCells) {
            var _0x1121C = this.myCells[_0x11205]
            _0x111EE += _0x1121C.getRealMass()
            _0x111D7++
        }
        hudElements.playerMass2.textContent = _0x111EE.toLocaleString()
        // Use textContent
        if (_0x111EE > this.score) {
            this.score = _0x111EE
            hudElements.playerScore2.textContent = this.score.toLocaleString()
        }
        this.updateCellCounter(_0x111D7)
    }
    PlayerTwoClient.prototype.updateCellCounter = function (_0x111D7, _0x111EE) {
        if (hudElements.playerCell2Count != _0x111D7 || _0x111EE) {
            hudElements.playerCell2Count = _0x111D7
            hudElements.playerCells2.textContent = _0x111D7 + "/" + this.getServerMaxCells()
            if (!clientSettings.cColoredCellCount) {
                var _0x11205 = _0x111D7 / this.getServerMaxCells()
                if (_0x11205 >= 1) {
                    hudElements.playerCells2.style.color = uiTheme.uiGameColorError
                } else {
                    if (_0x11205 >= 0.5) {
                        hudElements.playerCells2.style.color = uiTheme.uiGameColorWarning
                    } else {
                        hudElements.playerCells2.style.color = uiTheme.uiGameColorSuccess
                    }
                }
            } else {
                hudElements.playerCells2.style.color = uiTheme.uiForegroundColor
            }
        }
    }

    /**
     * Constructor for the first player's game client
     */
    function PlayerOneClient() {
        this.centerXs = 0x0
        this.centerYs = 0x0
        this.socket = null
        this.currentServer = null
        this.currentServerName = null
        this.spectate = false
        this.name = ""
        this.calculatedMouseY = 0
        this.calculatedMouseX = 0
        this.enabled = !![]
        this.playerId = 0
        this.bucket = new Map()
        this.foodObjects = new Map()
        this.myCells = {}
        this.playerRegistry = new PlayerRegistry()
        this.buffHolder = new buff_holder()
        this.centerX = 0
        this.centerY = 0
        this.prevCenterX = 0
        this.prevCenterY = 0
        this.centerX_ = 0
        this.centerY_ = 0
        this.centerSteps = 0
        this.scale = 0.5
        this.scale_ = 0.5
        this.scale_base = 0.5
        this.mouseZoom = 1
        this.offsetX = 0
        this.offsetY = 0
        this.mouseRawX = 0
        this.isLineSplitting = false
        // Tracks if linesplit is ON
        this.lineSplitAnchorX = 0
        // X position of the anchor (e.g., biggest cell) when activated
        this.lineSplitAnchorY = 0
        // Y position of the anchor
        this.lineSplitAxis = null
        // Locked axis ('x', 'y', or null if not locked yet)
        this.mouseRawY = 0
        this.mouseX = 0
        this.mouseY = 0
        this.mouseFrozen = false
        this.party = []
        this.partyIds = {}
        this.subPanelOverride = false
        this.serverData = {
            hasSentSubPanel: false,
            border: {},
            maxCells: 16
        }
        this.score = 0
        this.respawnCooldown = 0
        this.customGameMap = null
        this.accountListeners = {}
        this.clearStats()
        setInterval(this.sendPing.bind(this), 3e4)
    }
    /**
     * Send split command to the server
     * @param {number} splitCount - Number of split commands to send
     */
    PlayerOneClient.prototype.sendSplit = function (splitCount) {
        console.log(`[GameClient ${this.playerId || "N/A"}] Sending ${splitCount} split commands.`)
        const splitPacket = network.sendKey(17)
        // 17 is the split key code
        for (let i = 0; i < splitCount; i++) {
            this.sendPacket(splitPacket)
        }
        // If sound player exists:
        // soundPlayer.playSound('split');
    }
    /**
     * Gets the count of player cells
     * @returns {number} The number of cells the player has
     */
    PlayerOneClient.prototype.getMass = function () {
        var totalMass = 0
        var cellCount = 0

        // Count cells and sum their masses
        for (var cellId in this.myCells) {
            var cell = this.myCells[cellId]
            totalMass += cell.getRealMass()
            cellCount++
        }

        // Return the cell count (not the mass despite the function name)
        return cellCount
    }

    /**
     * Reset player statistics to default values
     */
    PlayerOneClient.prototype.clearStats = function () {
        this.stats = {
            name: "An unnamed cell",
            alive: 0,
            eatenFood: 0,
            eatenEject: 0,
            eatenVirus: 0,
            eatenPlayer: 0,
            gainFood: 0,
            gainEject: 0,
            gainVirus: 0,
            gainPlayer: 0
        }
    }
    /**
     * Start playing the game
     */
    PlayerOneClient.prototype.play = function () {
        if (selectedServer == null) {
            this.selfMsg("No server selected!")
            return
        }

        this.name = $("#name-box").val()
        this.spectate = false
        this.currentServerName = selectedServer.name
        scorePanel.querySelector("#pServer span").innerHTML = this.currentServerName
        hideMainMenu()

        if (this.isConnected() && this.currentServer == selectedServer.ip) {
            this.sendPacket(new network.setName(this.name))
        } else {
            this.connect(selectedServer.ip)
        }

        showHudElements()
        showGameUI(mainUI)
    }

    var testing = false
    /**
     * Enter spectate mode
     */
    PlayerOneClient.prototype.spec = function () {
        if (selectedServer == null) {
            this.selfMsg("No server selected!")
            return
        }

        this.spectate = true
        hideMainMenu()

        if (this.isConnected() && this.currentServer == selectedServer.ip) {
            this.sendPacket(new network.sendSpectate())
        } else {
            this.connect(selectedServer.ip)
        }

        showHudElements()
        showGameUI(mainUI)
    }
    PlayerOneClient.prototype.connect = function (_0x111EE) {
        if (this.socket != null) {
            this.socket.nextUrl = _0x111EE
            this.disconnect(_0x111EE)
            return
        }
        this.currentServer = _0x111EE
        this.currentServerName = selectedServer.name
        this.selfMsg("Connecting to " + (clientSettings.cHideServer ? "***Hidden***" : this.currentServerName))
        if (selectedServer.ssl == 1) {
            this.socket = new WebSocket("wss://" + _0x111EE)
        } else {
            this.socket = new WebSocket("ws://" + _0x111EE)
        }
        this.socket.binaryType = "arraybuffer"
        var _0x111D7 = this
        this.socket.onopen = this.onConnect.bind(this)
        this.socket.onmessage = this.onMessage.bind(this)
        this.socket.onclose = function (_0x111EE) {
            console.clear()
            _0x111D7.reset()
            _0x111D7.selfMsg("You have been disconnected from the server. Reason: " + (_0x111EE.reason === "" ? "Unknown" : _0x111EE.reason))
            if (this.nextUrl != null) {
                _0x111D7.connect(this.nextUrl)
            }
        }
        this.socket.onerror = function (_0x11205) {
            testing = true
            // Suppressed WebSocket error handler 2
        }
        document.body.classList.add("hide-captcha-badge")
    }
    PlayerOneClient.prototype.disconnect = function (_0x111D7) {
        if (this.socket != null) {
            this.socket.close()
        }

        this.serverData.border.enabled = false

        if (player2.socket != null) {
            player2.socket.close()
        }
    }
    PlayerOneClient.prototype.clearBuckets = function () {
        for (const cell of this.bucket.values()) {
            // Iterate over values
            cell.onDelete()
        }
        this.bucket.clear()
        // Clear the map efficiently

        for (const food of this.foodObjects.values()) {
            // Iterate over values
            food.onDelete()
        }
        this.foodObjects.clear()
        // Clear the map efficiently
    }
    PlayerOneClient.prototype.reset = function () {
        this.clearBuckets()
        this.myCells = {}
        this.playerRegistry.clear()
        this.playerId = 0
        this.score = 0
        this.respawnCooldown = 0
        this.customGameMap = null
        this.currentServer = null
        this.clearStats()
        this.clearParty()
        this.buffHolder.clearBuffs()
        lineSplitHelper.handlePlayerDeathOrDisconnect()
        // Add this line
        this.serverData.hasSentSubPanel = false
        this.serverData.resetType = 0
        this.serverData.autosplits = false
        // *** FIX 3: Explicitly remove and clear the border graphic ***
        if (borderGraphic != null && borderGraphic.parent) {
            borderGraphic.parent.removeChild(borderGraphic)
            borderGraphic.destroy()
            borderGraphic = null
        }

        this.serverData.border.enabled = false
        // Add if player2 has independent border data

        if (this.socket != null) {
            this.socket = null
        }
        scorePanel.querySelector("#pId span").innerHTML = this.playerId
        if (this.subPanelOverride) {
            this.subPanelOverride = false
            _0x127F1()
        }

        manageInvitePlayer2Button()
    }
    PlayerOneClient.prototype.handleKey = function (_0x111EE) {
        if (_0x111EE == activeKeybinds.kEjectMass) {
            _0x12836 = true
            this.sendPacket(new network.sendEjectMass(true))
            return
        }

        if (_0x111EE == activeKeybinds.kSplit) {
            if (lineSplitHelper.canSplitNow(1)) return
            this.sendSplit(1)
            return
        }

        if (_0x111EE == activeKeybinds.kToggleSpec) {
            this.sendPacket(new network.sendKey(18))
            return
        }

        if (_0x111EE == activeKeybinds.kDoubleSplit) {
            if (lineSplitHelper.canSplitNow(2)) return
            this.sendSplit(2)
            return
        }

        if (_0x111EE == activeKeybinds.kTripleSplit) {
            if (lineSplitHelper.canSplitNow(3)) return
            this.sendSplit(3)
            return
        }

        if (_0x111EE == activeKeybinds.kQuadSplit) {
            if (lineSplitHelper.canSplitNow(4)) return
            this.sendSplit(4)
            return
        }

        if (_0x111EE == activeKeybinds.kHexaSplit) {
            if (lineSplitHelper.canSplitNow(6)) return
            this.sendSplit(6)
            return
        }

        if (_0x111EE == activeKeybinds.k32xSplit) {
            if (lineSplitHelper.canSplitNow(5)) return
            this.sendSplit(5)
            return
        }

        if (_0x111EE == activeKeybinds.k128xSplit) {
            if (lineSplitHelper.canSplitNow(7)) return
            this.sendSplit(7)
            return
        }

        if (_0x111EE == activeKeybinds.k256xSplit) {
            if (lineSplitHelper.canSplitNow(8)) return
            this.sendSplit(8)
            return
        }

        if (_0x111EE == activeKeybinds.kMultiSplit) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer && typeof inactivePlayer.sendSplit === "function") {
                inactivePlayer.sendSplit(1)
            }
            return
        }

        if (_0x111EE == activeKeybinds.kMultiDouble) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer && typeof inactivePlayer.sendSplit === "function") {
                inactivePlayer.sendSplit(2)
            }
            return
        }

        if (_0x111EE == activeKeybinds.kMultiMax) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer && typeof inactivePlayer.sendSplit === "function") {
                inactivePlayer.sendSplit(8)
            }
            return
        }

        if (_0x111EE == activeKeybinds.kMultiEject) {
            var activePlayer = getActivePlayer()
            var inactivePlayer = activePlayer === player1 ? player2 : player1

            if (inactivePlayer) {
                inactivePlayer.sendPacket(new network.sendEjectMass(true))
            }
            return
        }

        if (_0x111EE == 38) {
            this.mouseZoom *= 1.05
            this.mouseZoom =
                player1.mouseZoom > 5 ? 5
                    : this.mouseZoom < 0.1 ? 0.1
                        : this.mouseZoom
            return
        }

        if (_0x111EE == 40) {
            this.mouseZoom *= 0.95
            this.mouseZoom =
                player1.mouseZoom > 5 ? 5
                    : this.mouseZoom < 0.1 ? 0.1
                        : this.mouseZoom
            return
        }

        if (_0x111EE == keyMappings.kFreezeMouse) {
            this.mouseFrozen = !this.mouseFrozen

            // Use the correct element IDs from the HTML
            const pMouseElement = document.getElementById("pMouse")
            const p2MouseElement = document.getElementById("p2Mouse")

            if (player1.mouseFrozen) {
                pMouseElement.classList.remove("d-none")
            } else {
                pMouseElement.classList.add("d-none")
            }

            if (player2.mouseFrozen) {
                p2MouseElement.classList.remove("d-none")
            } else {
                p2MouseElement.classList.add("d-none")
            }
            return
        }

        if (_0x111EE == activeKeybinds.kContextMenu) {
            _0x1156F()
            return
        }
    }

    PlayerOneClient.prototype.isConnected = function () {
        if (this.socket == null) {
            return false
        } else {
            return this.socket.readyState == 1
        }
    }
    PlayerOneClient.prototype.sendPacket = function (_0x111D7) {
        if (this.isConnected()) {
            this.socket.send(_0x111D7)
        }
    }
    PlayerOneClient.prototype.onConnect = async function () {
        chatCommands = []
        _0x118C2()
        this.sendPacket(new network.connectionStart())
        this.sendPing()
        this.sendOptions()

        // --- Original Firebase Auth / Final Setup Logic ---
        // This part now only runs if the API token check above passed.
        if (fb_app1.auth().currentUser !== null) {
            console.log("onConnect: Firebase user found, attempting to send Firebase token...")
            fb_app1
                .auth()
                .currentUser.getIdToken(true)
                .then((_0x111D7_firebaseToken) => {
                    // NOTE: This sends the FIREBASE token, not the backend JWT
                    console.log("onConnect: Sending Firebase auth token via packet.")
                    this.sendPacket(new network.sendAuthToken(_0x111D7_firebaseToken))
                })
                .catch((_0x111C0_firebaseError) => {
                    console.error("onConnect: Error getting Firebase token:", _0x111C0_firebaseError)
                    // Decide if failure here should also disconnect
                    // return _0x11AEA(_0x111C0_firebaseError, true); // Assuming _0x11AEA handles errors
                })
            // return; // Original code had return here, keep if intended
        } else {
            console.log("onConnect: No Firebase user. Sending name/spectate command.")
            if (!this.spectate) {
                this.sendPacket(new network.setName(this.name))
            } else {
                this.sendPacket(new network.sendSpectate())
            }
        }
    }
    /**
     * Send a ping packet to the server
     */
    PlayerOneClient.prototype.sendPing = function () {
        if (this.isConnected()) {
            pingTimestamp = +new Date()
            this.sendPacket(new network.sendPing())
        }
    }
    PlayerOneClient.prototype.sendOptions = function () {
        if (this.isConnected()) {
            this.sendPacket(new network.sendOptions())
        }
    }
    /**
     * Display a system message in the chat
     * @param {string} message - The message to display
     */
    PlayerOneClient.prototype.selfMsg = function (message) {
        var messageCell = document.createElement("td")
        var messageSpan = document.createElement("span")
        messageSpan.style.color = "#9b3ff1"
        messageSpan.innerHTML = "[System] " + message.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        messageCell.appendChild(messageSpan)
        addChatMessage(ChatTabFlags.SYSTEM, messageCell)
    }
    /**
     * Display a system message with a selectable join code
     * @param {string} message - The message to display
     * @param {string} joinCode - The join code to display (selectable)
     */
    PlayerOneClient.prototype.selfMsgWithJoinCode = function (message, joinCode) {
        var messageCell = document.createElement("td")
        var messageSpan = document.createElement("span")
        messageSpan.style.color = "#9b3ff1"
        messageSpan.innerHTML = "[System] " + message.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        messageCell.appendChild(messageSpan)
        var codeSpan = document.createElement("span")
        codeSpan.style.color = "#9b3ff1"
        codeSpan.innerHTML = joinCode
        codeSpan.style.pointerEvents = "all"
        codeSpan.style.userSelect = "all"
        messageCell.appendChild(codeSpan)
        addChatMessage(ChatTabFlags.SYSTEM, messageCell)
    }
    PlayerOneClient.prototype.clearParty = function (_0x111D7) {
        this.party = []
        this.partyIds = {}
        this.partyLeader = -1
        this.partyIndex = -1
        partyPanel.css("display", "none")
        if (scrimmageCustom.css("display") == "block") {
            this.handleCustomGameLeave()
        }
        if (this.partyCode != null || partyCodeVariable != null) {
            this.partyCode = partyCodeVariable = null
            window.history.pushState("page", "", " ")
        }
    }
    PlayerOneClient.prototype.isPartyLeader = function () {
        return this.partyLeader == this.playerId
    }
    PlayerOneClient.prototype.getServerMaxCells = function () {
        return this.serverData.maxCells + this.buffHolder.bonusMaxCells
    }
    PlayerOneClient.prototype.onMessage = function (FM) {
        var Fn = new DataView(FM.data)
        var Ff = Fn.getUint8(0x0)
        Fn.offset = 0x1
        switch (Ff) {
            case 0x2:
                this.handleUpdate(Fn)
                break
            case 0xa:
                this.handlePosition(Fn)
                break
            case 0x15:
                this.handleStats(Fn)
                break
            case 0x16:
                this.showSubPanel(Fn)
                break
            case 0x17:
                this.updateSubPanel(Fn)
                break
            case 0x28:
                this.handleInvite(Fn)
                break
            case 0x29:
                this.handlePartyInfo(Fn)
                break
            case 0x2d:
                this.handlePartyData(Fn)
                break
            case 0x2b:
                this.handlePartyJoinCode(Fn)
                break
            case 0x31:
                this.handleLeaderboard(Fn)
                break
            case 0x32:
                this.handleLeaderboardCustom(Fn)
                break
            case 0x3f:
                this.handleRespawnCooldown(Fn)
                break
            case 0x40:
                this.handleMapData(Fn)
                break
            case 0x41:
                this.handleClearNodes()
                break
            case 0x42:
                this.handleUpdateBorder(Fn)
                break
            case 0x44:
                this.handleResetTime(Fn)
                break
            case 0x45:
                this.handleSpectators(Fn)
                break
            case 0x46:
                this.handleSystemMsg(Fn)
                break
            case 0x47:
                this.handlePing()
                break
            case 0x48:
                this.handleChat(Fn)
                break
            case 0x49:
                this.handleWhisper(Fn)
                break
            case 0x4a:
                this.handleEditMessage(Fn)
                break
            case 0x50:
                this.handleShowScrimmageMenu()
                break
            case 0x51:
                this.handleQueueData(Fn)
                break
            case 0x52:
                this.handleQueueLeave(Fn)
                break
            case 0x53:
                this.handleMatchState(Fn)
                break
            case 0x5a:
                this.handleScrimmageData(Fn)
                break
            case 0x5b:
                this.handleCustomGameShow(Fn)
                break
            case 0x5c:
                this.handleCustomGameUpdate(Fn)
                break
            case 0x5d:
                this.handleCustomGameLeave()
                break
            case 0x5e:
                this.handleShowCustomGameLobbies(Fn)
                break
            case 0x64:
                this.handleAddBuff(Fn)
                break
            case 0x65:
                this.handleRemoveBuff(Fn)
                break
            case 0x66:
                this.handleClearBuffs(Fn)
                break
            case 0x67:
                this.handleAuthenticated(Fn)
                break
            case 0x68:
                this.handleProfile(Fn)
                break
        }
    }

    PlayerOneClient.prototype.handleUpdate = function (FM) {
        var Fn = FM.getUint16(FM.offset, !![])
        FM.offset += 0x2
        //console.log(this.bucket)
        //console.log(this.foodObjects)
        while (Fn > 0x0) {
            var Ff = FM.getUint16(FM.offset, !![])
            FM.offset += 0x2
            player1.playerRegistry.remove(Ff)
            Fn--
        }
        Fn = FM.getUint16(FM.offset, !![])
        FM.offset += 0x2
        while (Fn > 0x0) {
            var Ff = FM.getUint16(FM.offset, !![])
            FM.offset += 0x2
            //   var Fb = this.bucket[Ff] || this.foodObjects[Ff];
            var Fb = this.bucket.get(Ff) || this.foodObjects.get(Ff)
            if (Fb != null) {
                if (Fb.type == 0x6) {
                    // Call onDelete to clean up visual elements
                    Fb.onDelete()
                    // delete this.foodObjects[Ff];
                    this.foodObjects.delete(Ff)
                } else {
                    // Call onDelete to clean up visual elements
                    Fb.onDelete()
                    // delete this.bucket[Ff];
                    this.bucket.delete(Ff)
                }
                if (Fb.playerId == this.playerId) {
                    delete this.myCells[Ff]
                    if (Object.keys(this.myCells).length == 0x0) {
                        if (clientSettings.cAutoRespawn) {
                            if ($("#main").css("display") == "none") {
                                player1.play()
                            }
                        } else {
                            if (player2 && Object.keys(player2.myCells).length > 0x0) {
                                if(getActivePlayer()==player1)Fbs();
                            } else if (scrimmageMenu.css("display") != "block") {
                                mainMenuVisible = !mainMenuVisible
                                showUIElement(mainUI)
                            }
                            aiptag.cmd.display.push(function () {
                                aipDisplayTag.refresh("GOT_gota-io_336x280")
                            })
                        }
                    }
                }
                Fb.onDelete()
            }
            Fn--
        }
        while (!![]) {
            var Ff = FM.getUint16(FM.offset, !![])
            FM.offset += 0x2
            if (Ff == 0x0) {
                break
            }
            var Fh = this.playerRegistry.getPlayer(Ff)
            var Fr = ![]
            if (Fh == null) {
                Fh = new PlayerData(Ff)
            } else {
                Fr = !![]
            }
            Fh.cellColor = (FM.getUint8(FM.offset++) << 0x10) + (FM.getUint8(FM.offset++) << 0x8) + FM.getUint8(FM.offset++)
            Fh.name = _0x122E9(FM)
            Fh.setSkin(_0x12300(FM))
            Fh.setFlags(FM.getUint8(FM.offset++))
            if ((Fh.flags & 0x2) == 0x2) {
                Fh.nameColor = "#" + byteToHex(FM.getUint8(FM.offset++)) + byteToHex(FM.getUint8(FM.offset++)) + byteToHex(FM.getUint8(FM.offset++))
                Fh.parseEffect(FM.getUint8(FM.offset++))
                Fh.nameFont = FM.getUint8(FM.offset++)
            }
            if (!Fr) {
                player1.playerRegistry.add(Fh)
            } else {
                player1.playerRegistry.updatePlayer(Fh)
            }
        }
        while (!![]) {
            var FV = FM.getUint8(FM.offset++)
            var Fx = 0x0
            if (FV == 0x0) {
                break
            }
            while (!![]) {
                if (FV == 0x2 && Fx == 0x0) {
                    Fx = FM.getUint16(FM.offset, !![])
                    FM.offset += 0x2
                    if (Fx == 0x0) {
                        break
                    }
                }
                var Ff = FM.getUint16(FM.offset, !![])
                FM.offset += 0x2
                if (Ff == 0x0) {
                    if (FV == 0x2) {
                        Fx = 0x0
                        continue
                    } else {
                        break
                    }
                }
                var Fb = new GameCell(Ff, player1)
                Fb.setType(FV)
                Fb.setX(FM.getInt16(FM.offset, !![]))
                Fb.setY(FM.getInt16(FM.offset + 0x2, !![]))
                FM.offset += 0x4
                switch (FV) {
                    case 0x6:
                        Fb.color = _0x122A4[Fb.id % _0x122A4.length]
                        break
                    case 0x1:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        Fb.color = (FM.getUint8(FM.offset++) << 0x10) + (FM.getUint8(FM.offset++) << 0x8) + FM.getUint8(FM.offset++)
                        var FI = FM.getUint8(FM.offset++)
                        Fb.skin = (FI & 0x7f) - 0x1
                        Fb.rainbow = (FI & 0x80) == 0x80
                        break
                    case 0x2:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2

                        Fb.playerId = Fx

                        break
                    case 0x3:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        break
                    case 0x4:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        break
                    case 0x5:
                        Fb.setSize(FM.getUint16(FM.offset, !![]))
                        FM.offset += 0x2
                        Fb.buff = FM.getUint8(FM.offset++)
                        break
                }
                Fb.onCreate(this)
            }
        }
        while (!![]) {
            var FV = FM.getUint8(FM.offset++)
            if (FV == 0x0) {
                break
            }
            while (!![]) {
                var Ff = FM.getUint16(FM.offset, !![])
                FM.offset += 0x2
                if (Ff == 0x0) {
                    break
                }
                var N0 = FM.getInt16(FM.offset, !![])
                var N1 = FM.getInt16(FM.offset + 0x2, !![])
                FM.offset += 0x4
                var Fb
                if (FV == 0x6) {
                    //  Fb = this.foodObjects[Ff];
                    Fb = this.foodObjects.get(Ff)
                } else {
                    // Fb = this.bucket[Ff];
                    Fb = this.bucket.get(Ff)
                }
                if (Fb == null) {
                    Fb = new GameCell(Ff, player1)
                    Fb.setType(FV)
                    Fb.setSize(0xa)
                    Fb.setX(N0)
                    Fb.setY(N1)
                    Fb.onCreate(this)
                } else {
                    Fb.updateX(N0)
                    Fb.updateY(N1)
                }
                switch (FV) {
                    case 0x2:
                        Fb.size_ = FM.getUint16(FM.offset, !![])
                        FM.offset += 0x2
                        break
                    case 0x3:
                        Fb.size_ = FM.getUint16(FM.offset, !![])
                        FM.offset += 0x2
                        break
                    case 0x4:
                        Fb.size_ = FM.getUint16(FM.offset, !![])
                        FM.offset += 0x2
                        break
                }
                Fb.steps = 0x1e
            }
        }
        this.sortCells()
    }
    PlayerOneClient.prototype.handlePosition = function (_0x111D7) {
        this.centerX_ = _0x111D7.getFloat32(_0x111D7.offset, true)
        _0x111D7.offset += 4
        this.centerY_ = _0x111D7.getFloat32(_0x111D7.offset, true)
        _0x111D7.offset += 4
        this.centerSteps = 30
        if (!clientSettings.cDisableAutoZoom && !clientSettings.cDualMode) {
            this.scale_base = _0x111D7.getFloat32(_0x111D7.offset, true)
        }
    }
    PlayerOneClient.prototype.handleRespawnCooldown = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getFloat64(_0x111EE.offset, true)
        this.respawnCooldown = _0x111D7
    }
    PlayerOneClient.prototype.handleMapData = function (_0x111D7) {
        this.playerId = _0x111D7.getUint16(_0x111D7.offset, true)
        _0x111D7.offset += 3
        this.handleUpdateBorder(_0x111D7)
        this.serverData.maxCells = _0x111D7.getUint16(_0x111D7.offset, true)
        _0x111D7.offset += 2
        _0x12300(_0x111D7)
        this.serverData.autosplits = _0x111D7.getUint8(_0x111D7.offset++)
        scorePanel.querySelector("#pId span").innerHTML = this.playerId
        this.updateCellCounter(0, true)
        // Check if there's a party code to join
        var partyCode = window.location.hash.substring(1)
        if (partyCode && partyCode.length > 0) {
            player1.sendPacket(new network.sendPartyJoin(partyCode))
        }
        scrimmageMenu.css("display", "none")
        $("#scrimmage-btn-leave").css("display", "none")

        manageInvitePlayer2Button()
    }
    PlayerOneClient.prototype.handleUpdateBorder = function (_0x111D7) {
        this.serverData.border = {}
        this.serverData.border.left = _0x111D7.getInt16(_0x111D7.offset, true)
        this.serverData.border.top = _0x111D7.getInt16(_0x111D7.offset + 2, true)
        this.serverData.border.right = _0x111D7.getInt16(_0x111D7.offset + 4, true)
        this.serverData.border.bottom = _0x111D7.getInt16(_0x111D7.offset + 6, true)
        _0x111D7.offset += 8
        this.serverData.border.width = this.serverData.border.right - this.serverData.border.left
        this.serverData.border.height = this.serverData.border.bottom - this.serverData.border.top
        this.serverData.border.enabled = this.serverData.border.width != 0 && this.serverData.border.height != 0
        drawGameBorder()
    }
    PlayerOneClient.prototype.handleResetTime = function (_0x11205) {
        var _0x111EE = _0x11205.getUint8(_0x11205.offset++)
        var _0x111D7 = _0x11205.getFloat64(_0x11205.offset, true)
        this.serverData.resetType = _0x111EE
        this.serverData.resetTime = _0x111D7
    }
    PlayerOneClient.prototype.handleSpectators = function (_0x111D7) {
        this.spectators = _0x111D7.getUint16(_0x111D7.offset, true)
        this.updateSpectators()
    }
    PlayerOneClient.prototype.handleClearNodes = function (_0x111D7) {
        this.clearBuckets()
    }
    PlayerOneClient.prototype.handleLeaderboard = function (_0x11278) {
        var _0x11233 = document.getElementById("leaderboard-canvas")
        var _0x111EE = _0x11233.getContext("2d")
        leaderboardHeader.text("Leaderboard")
        var _0x111D7 = _0x11278.getUint32(_0x11278.offset, true)
        _0x11278.offset += 4
        _0x11233.width = 200
        _0x11233.height = 20 * _0x111D7 + 5
        _0x111EE.font = "16px Calibri"
        var _0x11261 = 20
        for (var _0x11205 = 0; _0x11205 < _0x111D7; _0x11205++) {
            var _0x1121C = _0x11278.getUint16(_0x11278.offset, true)
            _0x11278.offset += 2
            var _0x1124A = _0x122E9(_0x11278) || "An unnamed cell"
            if (_0x1121C == this.playerId) {
                _0x111EE.fillStyle = uiTheme.uiLeaderboardHighlightSelf
            } else {
                if (this.partyIds[_0x1121C] != null) {
                    _0x111EE.fillStyle = uiTheme.uiLeaderboardHighlightParty
                } else {
                    _0x111EE.fillStyle = uiTheme.uiForegroundColor
                }
            }
            _0x111EE.fillText(_0x11205 + 1 + ". " + _0x1124A, 10, _0x11261)
            _0x11261 += 20
        }
    }
    PlayerOneClient.prototype.handleLeaderboardCustom = function (_0x1128F) {
        var _0x11233 = document.getElementById("leaderboard-canvas")
        var _0x11205 = _0x11233.getContext("2d")
        leaderboardHeader.html("Leaderboard")
        var _0x111D7 = _0x1128F.getUint16(_0x1128F.offset, true)
        var _0x111EE = _0x1128F.getUint8(_0x1128F.offset + 2, true)
        var _0x11278 = _0x1128F.getUint8(_0x1128F.offset + 3, true)
        _0x1128F.offset += 4
        _0x11233.width = 200
        _0x11233.height = 20 * _0x111D7 + 5
        _0x11205.font = "16px Calibri"
        var _0x11261 = 20
        for (var _0x1121C = 0; _0x1121C < _0x111D7; _0x1121C++) {
            var _0x1124A = _0x12300(_0x1128F)
            if (_0x1121C == _0x111EE) {
                _0x11205.fillStyle = uiTheme.uiLeaderboardHighlightSelf
            } else {
                _0x11205.fillStyle = uiTheme.uiForegroundColor
            }
            _0x11205.fillText(_0x1124A, 5, _0x11261)
            _0x11261 += 20
        }
    }
    PlayerOneClient.prototype.handlePing = function () {
        var _0x111D7 = +new Date() - pingTimestamp
        var playerTwoConnected = player2.isConnected()
        if (!clientSettings.cColoredPing) {
            if (_0x111D7 < 100) {
                scorePanel.querySelector("#pPing span").style.color = uiTheme.uiGameColorSuccess
                if (playerTwoConnected) scorePanel2.querySelector("#p2Ping span").style.color = uiTheme.uiGameColorSuccess
            } else {
                if (_0x111D7 < 200) {
                    scorePanel.querySelector("#pPing span").style.color = uiTheme.uiGameColorWarning
                    if (playerTwoConnected) scorePanel2.querySelector("#p2Ping span").style.color = uiTheme.uiGameColorWarning
                } else {
                    scorePanel.querySelector("#pPing span").style.color = uiTheme.uiGameColorError
                    if (playerTwoConnected) scorePanel2.querySelector("#p2Ping span").style.color = uiTheme.uiGameColorError
                }
            }
        } else {
            scorePanel.querySelector("#pPing span").style.color = uiTheme.uiForegroundColor
            if (playerTwoConnected) scorePanel2.querySelector("#p2Ping span").style.color = uiTheme.uiForegroundColor
        }
        scorePanel.querySelector("#pPing span").textContent = _0x111D7 + "ms"
        // Use textContent
        if (playerTwoConnected) scorePanel2.querySelector("#p2Ping span").textContent = _0x111D7 + "ms"
        // Use textContent
    }
    PlayerOneClient.prototype.handleChat = function (_0x1135E) {
        var _0x111D7 = _0x1135E.getUint8(_0x1135E.offset++)
        var _0x112D4 = "rgb(" + _0x1135E.getUint8(_0x1135E.offset++) + "," + _0x1135E.getUint8(_0x1135E.offset++) + "," + _0x1135E.getUint8(_0x1135E.offset++) + ")"
        var _0x11205 = _0x1135E.getUint8(_0x1135E.offset++)
        var _0x11302 = _0x1135E.getUint16(_0x1135E.offset, true)
        _0x1135E.offset += 2
        if (chatCommands.includes(_0x11302)) {
            return
        }
        var _0x11330 = _0x122E9(_0x1135E)
        _0x1135E.getUint8(_0x1135E.offset++)
        var _0x112A6 = _0x122E9(_0x1135E).replace(/</g, "&lt;").replace(/>/g, "&gt;") || "An unnamed cell"
        var _0x11278 = _0x122E9(_0x1135E).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        var _0x11233 = ChatTabFlags.ALL
        var _0x1128F = _0x1135E.offset < _0x1135E.byteLength ? _0x1135E.getBigInt64(_0x1135E.offset, true) : 0
        var _0x111EE
        switch (_0x111D7) {
            case 1:
                _0x111EE = "Party"
                _0x11233 = ChatTabFlags.PARTY
                break
            case 2:
                _0x111EE = "Admin"
                _0x11233 = ChatTabFlags.ADMIN
                break
            default:
                _0x111EE = "All"
                break
        }
        if (_0x11330.length > 0) {
            ; (_0x111EE += " - " + _0x11330).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }
        var _0x11261 = document.createElement("td")
        if (_0x1128F != 0) {
            _0x11261.dataset.msgid = _0x1128F
        }
        var _0x11319 = document.createElement("span")
        _0x11319.innerHTML = "[" + _0x111EE + "] "
        _0x11261.appendChild(_0x11319)
        var _0x112EB = document.createElement("span")
        _0x112EB.innerText = _0x112A6
        _0x112EB.dataset.playerId = _0x11302
        _0x112EB.style.color = _0x112D4
        _0x112EB.className = "chat-name"
        _0x112EB.oncontextmenu = onChatNameContextMenu
        _0x11261.appendChild(_0x112EB)
        var _0x1124A = document.createElement("span")
        _0x1124A.innerHTML = ": "
        _0x11261.appendChild(_0x1124A)
        var _0x11347 = document.createElement("span")
        _0x11347.className = "chat-content"
        _0x11347.style.color = _0x114A0[_0x11205]
        _0x11347.innerHTML = _0x120AA(_0x11278)
        _0x11261.appendChild(_0x11347)
        addChatMessage(_0x11233, _0x11261)
    }
    PlayerOneClient.prototype.handleWhisper = function (_0x11319) {
        var _0x1128F = _0x122E9(_0x11319).replace(/</g, "&lt;").replace(/>/g, "&gt;") || "An unnamed cell"
        var _0x112D4 = _0x11319.getUint16(_0x11319.offset, true)
        _0x11319.offset += 2
        if (chatCommands.includes(_0x112D4)) {
            return
        }
        var _0x112A6 = "rgb(" + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + ")"
        var _0x11233 = _0x122E9(_0x11319).replace(/</g, "&lt;").replace(/>/g, "&gt;") || "An unnamed cell"
        var _0x11261 = _0x11319.getUint16(_0x11319.offset, true)
        _0x11319.offset += 2
        var _0x1124A = "rgb(" + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + "," + _0x11319.getUint8(_0x11319.offset++) + ")"
        var _0x11205 = _0x122E9(_0x11319).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        var _0x111EE = document.createElement("td")
        var _0x112EB = document.createElement("span")
        _0x112EB.innerText = _0x1128F
        _0x112EB.dataset.playerId = _0x112D4
        _0x112EB.style.color = _0x112A6
        _0x112EB.className = "chat-name"
        _0x112EB.oncontextmenu = onChatNameContextMenu
        _0x111EE.appendChild(_0x112EB)
        var _0x111D7 = document.createElement("span")
        _0x111D7.innerHTML = " > "
        _0x111EE.appendChild(_0x111D7)
        var _0x11278 = document.createElement("span")
        _0x11278.innerText = _0x11233
        _0x11278.dataset.playerId = _0x11261
        _0x11278.style.color = _0x1124A
        _0x11278.className = "chat-name"
        _0x11278.oncontextmenu = onChatNameContextMenu
        _0x111EE.appendChild(_0x11278)
        var _0x11302 = document.createElement("span")
        _0x11302.innerHTML = ": " + _0x120AA(_0x11205)
        _0x111EE.appendChild(_0x11302)
        addChatMessage(ChatTabFlags.WHISPER, _0x111EE)
    }
    PlayerOneClient.prototype.handleEditMessage = function (_0x11205) {
        var _0x111EE = _0x11205.getBigInt64(_0x11205.offset, true)
        _0x11205.offset += 8
        var _0x111D7 = _0x122E9(_0x11205).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        if (_0x111D7.length > 0) {
            $(".chat-table td[data-msgid='" + _0x111EE + "'] .chat-content").html(_0x120AA(_0x111D7))
        } else {
            $(".chat-table td[data-msgid='" + _0x111EE + "']")
                .closest("tr")
                .remove()
        }
    }
    PlayerOneClient.prototype.handleSystemMsg = function (_0x111EE) {
        var _0x111D7 = _0x122E9(_0x111EE)
        this.selfMsg(_0x111D7)
    }
    PlayerOneClient.prototype.handleAuthenticated = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(1)
        switch (_0x111D7) {
            case AuthenticatedResponse.SUCCESS:
                break
            case AuthenticatedResponse.FAILURE:
                this.selfMsg("Invalid authentication token! Please logout and try again!")
                break
        }
        if (!this.spectate) {
            this.sendPacket(new network.setName(this.name))
        } else {
            this.sendPacket(new network.sendSpectate())
        }
    }
    PlayerOneClient.prototype.handleProfile = function (_0x11205) {
        var _0x111D7 = _0x12300(_0x11205)
        var _0x111EE = JSON.parse(_0x111D7)
        showAccountProfile(_0x111EE)
    }
    PlayerOneClient.prototype.handleInvite = function (_0x11205) {
        if (clientSettings.cAutoDecline) {
            player1.sendPacket(new network.sendInviteResponse(false))
        } else {
            var _0x111EE = _0x122E9(_0x11205).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            var _0x111D7 = document.getElementById("popup-party-text")
            _0x111D7.innerText = _0x111EE + " has invited you to a party."
            showUIElement($("#popup-party"))
        }
    }
    PlayerOneClient.prototype.handlePartyInfo = function (_0x1128F) {
        var _0x11233 = {}
        var _0x11261 = []
        var _0x1124A = -1
        var _0x111D7 = _0x1128F.getUint16(_0x1128F.offset, true)
        _0x1128F.offset += 2
        for (var _0x11205 = 0; _0x11205 < _0x111D7; _0x11205++) {
            var _0x1121C = {}
            var _0x111EE = _0x1128F.getUint8(_0x1128F.offset++)
            _0x1121C.id = _0x1128F.getUint16(_0x1128F.offset, true)
            _0x11233[_0x1121C.id] = _0x11205
            _0x1128F.offset += 2
            if (_0x111EE == 1) {
                _0x1124A = _0x1121C.id
                _0x1121C.isLeader = true
            } else {
                _0x1121C.isLeader = false
            }
            _0x1121C.name = _0x122E9(_0x1128F) || "An unnamed cell"
            _0x1121C.x = 0
            _0x1121C.y = 0
            _0x1121C.x_ = 0
            _0x1121C.y_ = 0
            _0x1121C.score = 0
            _0x1121C.cache = -1
            _0x1121C.team = 0
            _0x1121C.state = PlayerState.UNKNOWN
            if (this.partyIds[_0x1121C.id] != null) {
                var _0x11278 = this.party[this.partyIds[_0x1121C.id]]
                _0x1121C.x = _0x11278.x
                _0x1121C.y = _0x11278.y
                _0x1121C.x_ = _0x11278.x_
                _0x1121C.y_ = _0x11278.y_
                _0x1121C.state = _0x11278.state
                _0x1121C.score = _0x11278.score
                _0x1121C.cache = _0x11278.cache
                _0x1121C.mmColor = _0x11278.mmColor
            } else {
                _0x1121C.mmColor = _0x122BB[_0x1121C.id % _0x122BB.length]
            }
            _0x11261.push(_0x1121C)
        }
        this.party = _0x11261
        this.partyIds = _0x11233
        if (this.partyLeader != _0x1124A) {
            this.partyLeader = _0x1124A
            if (scrimmageCustom.css("display") == "block") {
                ScrimmageHelper.checkLeader()
            }
        }
        if (_0x111D7 > 0) {
            this.drawParty()
        } else {
            this.clearParty()
        }
        manageInvitePlayer2Button()
    }
    PlayerOneClient.prototype.handlePartyData = function (_0x1121C) {
        var _0x111D7 = _0x1121C.getUint16(_0x1121C.offset, true)
        _0x1121C.offset += 2
        if (_0x111D7 != this.party.length) {
            return
        }
        for (var _0x111EE = 0; _0x111EE < _0x111D7; _0x111EE++) {
            var _0x11205 = this.party[_0x111EE]
            _0x11205.state = _0x1121C.getUint8(_0x1121C.offset++)
            if (_0x11205.state === PlayerState.ALIVE) {
                _0x11205.x_ = _0x1121C.getInt16(_0x1121C.offset, true)
                _0x11205.y_ = _0x1121C.getInt16(_0x1121C.offset + 2, true)
                _0x11205.score = _0x1121C.getInt32(_0x1121C.offset + 4, true)
                _0x1121C.offset += 8
            }
        }
        this.drawParty()
    }
    PlayerOneClient.prototype.handlePartyJoinCode = function (_0x11205) {
        var _0x111D7 = _0x12300(_0x11205)
        this.partyCode = _0x12300(_0x11205)
        if (this.partyCode.length != 0) {
            this.selfMsgWithJoinCode(_0x111D7, this.partyCode)
            $("#popup-party-code-content input").val(this.partyCode)
            $("#popup-party-code").show()
            var _0x111EE = "#" + this.currentServerName + "&" + this.partyCode
            window.history.pushState("page", "", _0x111EE)
        } else {
            this.selfMsg(_0x111D7)
            this.partyCode = null
            window.history.pushState("page", "", " ")
        }
    }
    PlayerOneClient.prototype.handleStats = function (_0x11205) {
        var _0x111D7 = _0x11205.getUint16(_0x11205.offset, true)
        _0x11205.offset += 2
        this.stats.name = _0x122E9(_0x11205) || "An unnamed cell"
        this.stats.alive += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenFood += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenEject += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenVirus += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.eatenPlayer += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainFood += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainEject += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainVirus += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        this.stats.gainPlayer += _0x11205.getUint32(_0x11205.offset, true)
        _0x11205.offset += 4
        var _0x111EE = $("#main-stats")
        _0x111EE.empty()
        _0x111EE.append("<span>Name: " + this.stats.name + " (" + _0x111D7 + ")</span><br>")
        _0x111EE.append("<span>Alive: " + formatAliveTime(this.stats.alive) + "</span><br>")
        _0x111EE.append("<span>Food eaten: " + this.stats.eatenFood + " (" + this.stats.gainFood + ")</span><br>")
        _0x111EE.append("<span>Ejected mass eaten: " + this.stats.eatenEject + " (" + this.stats.gainEject + ")</span><br>")
        _0x111EE.append("<span>Viruses eaten: " + this.stats.eatenVirus + " (" + this.stats.gainVirus + ")</span><br>")
        _0x111EE.append("<span>Player cells eaten: " + this.stats.eatenPlayer + " (" + this.stats.gainPlayer + ")</span><br>")
    }
    PlayerOneClient.prototype.showSubPanel = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(_0x111EE.offset++) == 1
        this.subPanelOverride = _0x111D7
        _0x127F1()
        if (_0x111D7) {
            if (!this.serverData.hasSentSubPanel) {
                _0x127DA()
                this.serverData.hasSentSubPanel = true
            }
            document.body.classList.add("hide-captcha-badge")
        }
    }
    PlayerOneClient.prototype.updateSubPanel = function (_0x111D7) {
        if (globalUserData) {
            _0x11D6E(globalUserData.uid)
        }
    }
    PlayerOneClient.prototype.updateSpectators = function () {
        hudElements.spectatorCount.text(this.spectators)
        // jQuery's .text() is equivalent to
    }
    PlayerOneClient.prototype.handleAddBuff = function (_0x1121C) {
        var _0x111D7 = _0x1121C.getUint8(_0x1121C.offset++)
        var _0x11205 = _0x1121C.getUint8(_0x1121C.offset++)
        var _0x111EE = _0x1121C.getFloat64(_0x1121C.offset, true)
        _0x1121C.offset += 8
        this.buffHolder.onAddBuff(_0x111D7, _0x11205, _0x111EE)
    }
    PlayerOneClient.prototype.handleRemoveBuff = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(_0x111EE.offset++)
        this.buffHolder.onRemoveBuff(_0x111D7)
    }
    PlayerOneClient.prototype.handleClearBuffs = function (_0x111EE) {
        var _0x111D7 = _0x111EE.getUint8(_0x111EE.offset++) == 1 ? true : false
        this.buffHolder.clearBuffs(_0x111D7)
    }
    /**
     * Sort cells by size
     */
    PlayerOneClient.prototype.sortCells = function () {
        // Sort the cells in the cell container by size
        cellContainer.children.sort(function (cell1, cell2) {
            return cell1.parentCell.size - cell2.parentCell.size
        })
        this.updateScorePanel()
    }
    PlayerOneClient.prototype.updateScorePanel = function () {
        var _0x111EE = 0
        var _0x111D7 = 0
        for (var _0x11205 in this.myCells) {
            var _0x1121C = this.myCells[_0x11205]
            _0x111EE += _0x1121C.getRealMass()
            _0x111D7++
        }
        hudElements.playerMass.textContent = _0x111EE.toLocaleString()
        // Use textContent
        if (_0x111EE > this.score) {
            this.score = _0x111EE
            hudElements.playerScore.textContent = this.score.toLocaleString()
        }
        this.updateCellCounter(_0x111D7)
    }
    PlayerOneClient.prototype.updateCellCounter = function (_0x111D7, _0x111EE) {
        if (hudElements.playerCellCount != _0x111D7 || _0x111EE) {
            hudElements.playerCellCount = _0x111D7
            hudElements.playerCells.textContent = _0x111D7 + "/" + this.getServerMaxCells()
            // U
            if (!clientSettings.cColoredCellCount) {
                var _0x11205 = _0x111D7 / this.getServerMaxCells()
                if (_0x11205 >= 1) {
                    hudElements.playerCells.style.color = uiTheme.uiGameColorError
                } else {
                    if (_0x11205 >= 0.5) {
                        hudElements.playerCells.style.color = uiTheme.uiGameColorWarning
                    } else {
                        hudElements.playerCells.style.color = uiTheme.uiGameColorSuccess
                    }
                }
            } else {
                hudElements.playerCells.style.color = uiTheme.uiForegroundColor
            }
        }
    }
    PlayerOneClient.prototype.drawParty = function () {
        if (this.party.length === 0) {
            return
        }
        if (clientSettings.cHidePartyPanel) {
            partyPanel.css("display", "none")
        } else {
            if (partyPanel.css("display") === "none" && hudPanel.css("display") !== "none") {
                partyPanel.css("display", "block")
            }
        }
        const canvas = document.getElementById("party-canvas")
        const ctx = canvas.getContext("2d")
        ctx.font = "bold 16px Poppins"
        // Set desired font
        // -- Add the "Leave Party" button --

        let nameWidth = 0
        let scoreWidth = 0
        let totalScore = 0
        for (let i = 0; i < this.party.length; i++) {
            const player = this.party[i]
            if (player.cache === -1) {
                player.cache = ctx.measureText(`${i + 1}. ${player.name}`).width;
            }
            nameWidth = Math.max(nameWidth, player.cache);
            if (player.state === PlayerState.ALIVE || player.state === PlayerState.UNKNOWN) {
                player.scoreText = player.score.toLocaleString();
                totalScore += player.score;
            } else {
                player.scoreText = player.state === PlayerState.DEAD ? 'DEAD' : 'SPEC';
            }
            const scoreTextWidth = ctx.measureText(player.scoreText).width
            scoreWidth = Math.max(scoreWidth, scoreTextWidth);

        }
        const totalScoreText = totalScore.toLocaleString();
        scoreWidth = Math.max(scoreWidth, ctx.measureText(totalScoreText).width);
        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = 15 + nameWidth + 50 + scoreWidth;
        const canvasHeight = 26 * this.party.length + 5 + (this.party.length > 1 ? 26 : 0);
        ctx.imageSmoothingEnabled = false;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr
        canvas.style.width = `${canvasWidth}px`;
        canvas.style.height = `${canvasHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = "bold 16px Poppins"
        let y = 22
        const scoreX = 5 + nameWidth + 50
        for (let i = 0; i < this.party.length; i++) {
            const player = this.party[i];
            ctx.fillStyle = player.isLeader ? uiTheme.uiPartyLeaderColor : uiTheme.uiForegroundColor;
            ctx.fillText(`${ i + 1 }. ${ player.name }`, 5, y);
            ctx.fillText(player.scoreText, scoreX, y)
            y += 26
            // Increase line spacing
        }
        if (this.party.length > 1) {
            ctx.fillStyle = uiTheme.uiForegroundColor
            ctx.fillText("Total:", 5, y)
            ctx.fillText(totalScoreText, scoreX, y)
        }
    }
    PlayerOneClient.prototype.handleShowScrimmageMenu = function () {
        mainUI.stop(true, false)
        mainUI.css("display", "none")
        scrimmageMenu.css("display", "block")
        $("#scrimmage-btn-leave").css("display", "none")
        player1.serverData.border.enabled = false
    }
    PlayerOneClient.prototype.handleQueueData = function (_0x11261) {
        var _0x11205 = _0x12300(_0x11261)
        var _0x1124A = _0x11261.getUint32(_0x11261.offset, true)
        _0x11261.offset += 4
        var _0x11233 = _0x11261.offset < _0x11261.byteLength ? _0x11261.getUint8(_0x11261.offset) : -1
        var _0x111EE = document.getElementById("leaderboard-canvas")
        var _0x111D7 = _0x111EE.getContext("2d")
        leaderboardHeader.html("Queue")
        _0x111EE.width = 200
        _0x111EE.height = 20 * (2 + (_0x11233 != -1 ? 1 : 0)) + 5
        _0x111D7.font = "16px Calibri"
        var _0x1121C = 20
        _0x111D7.fillStyle = uiTheme.uiForegroundColor
        _0x111D7.fillText("Mode: " + _0x11205, 5, _0x1121C)
        _0x1121C += 20
        _0x111D7.fillText("Time: " + formatAliveTime(_0x1124A), 5, _0x1121C)
        if (_0x11233 != -1) {
            _0x1121C += 20
            _0x111D7.fillText("Queued players: " + _0x11233, 5, _0x1121C)
        }
    }
    PlayerOneClient.prototype.handleQueueLeave = function (_0x11205) {
        var _0x111EE = _0x12300(_0x11205)
        var _0x111D7 = document.getElementById("leaderboard-canvas")
        _0x111D7.width = 0
        _0x111D7.height = 0
        this.selfMsg("You have left the queue for [" + _0x111EE + "]")
    }
    PlayerOneClient.prototype.handleMatchState = function (_0x111EE) {
        var _0x111D7 = _0x111EE.byteLength == 1 ? 0 : _0x111EE.getUint8(_0x111EE.offset++)
        if (_0x111D7 == 0) {
            this.selfMsg("A match has been found. Good luck and have fun!")
            _0x124B5()
        } else {
            if (_0x111D7 == 1) {
                $("#scrimmage-btn-leave").css("display", "block")
            }
        }
    }
    PlayerOneClient.prototype.handleScrimmageData = function (_0x112D4) {
        var _0x111D7 = _0x112D4.getUint8(_0x112D4.offset++)
        var _0x1128F = $("#scrimmage-mode-select")
        var _0x11278 = $("#scrimmage-mode-info")
        var _0x112BD = parseInt(_0x1128F.val())
        _0x1128F.empty()
        _0x11278.empty()
        var _0x111EE = {}
        while (_0x111D7 > 0) {
            var _0x11233 = _0x112D4.getUint8(_0x112D4.offset++)
            var _0x112A6 = _0x12300(_0x112D4)
            var _0x1124A = _0x12300(_0x112D4)
            var _0x11205 = document.createElement("option")
            _0x11205.innerHTML = _0x112A6
            _0x11205.value = _0x11233
            _0x1128F.append(_0x11205)
            _0x11205 = document.createElement("div")
            _0x11205.innerHTML = _0x1124A
            _0x11205.id = "scrimmage-info-" + _0x11233
            _0x11205.style.display = "none"
            _0x11278.append(_0x11205)
            _0x111EE[_0x11233] = true
            _0x111D7--
        }
        _0x123CF = {
            modes: {},
            sizes: {},
            maps: []
        }
        if (_0x112D4.byteLength - 1 > _0x112D4.offset) {
            _0x111D7 = _0x112D4.getUint8(_0x112D4.offset++)
            while (_0x111D7 > 0) {
                var _0x11233 = _0x112D4.getUint8(_0x112D4.offset++)
                var _0x112A6 = _0x12300(_0x112D4)
                _0x123CF.modes[_0x11233] = {
                    id: _0x11233,
                    name: _0x112A6
                }
                _0x111D7--
            }
            _0x111D7 = _0x112D4.getUint8(_0x112D4.offset++)
            while (_0x111D7 > 0) {
                var _0x11233 = _0x112D4.getUint8(_0x112D4.offset++)
                var _0x112A6 = _0x12300(_0x112D4)
                _0x123CF.sizes[_0x11233] = {
                    id: _0x11233,
                    name: _0x112A6
                }
                _0x111D7--
            }
            _0x111D7 = _0x112D4.getUint8(_0x112D4.offset++)
            while (_0x111D7 > 0) {
                var _0x112A6 = _0x12300(_0x112D4)
                var _0x11261 = {
                    name: _0x112A6,
                    startmass: 0,
                    teams: 0,
                    modes: [],
                    sizes: []
                }
                var _0x1121C = _0x112D4.getUint8(_0x112D4.offset++)
                while (_0x1121C > 0) {
                    _0x11261.modes.push(_0x112D4.getUint8(_0x112D4.offset++))
                    _0x1121C--
                }
                var _0x1121C = _0x112D4.getUint8(_0x112D4.offset++)
                while (_0x1121C > 0) {
                    _0x11261.sizes.push(_0x112D4.getUint8(_0x112D4.offset++))
                    _0x1121C--
                }
                _0x11261.startmass = _0x112D4.getUint16(_0x112D4.offset, true)
                _0x112D4.offset += 2
                _0x11261.respawnDelay = _0x112D4.getInt16(_0x112D4.offset, true)
                _0x112D4.offset += 2
                _0x11261.teams = _0x112D4.getUint8(_0x112D4.offset++)
                _0x123CF.maps.push(_0x11261)
                _0x111D7--
            }
        }
        $("#scrimmage-custom-btn-container").css("display", _0x123CF.maps.length == 0 ? "none" : "block")
        $("#scrimmage-map").empty()
        for (var _0x1121C = 0; _0x1121C < _0x123CF.maps.length; _0x1121C++) {
            $("#scrimmage-map").append("<option value='" + _0x1121C + "'>" + _0x123CF.maps[_0x1121C].name + "</option>")
        }
        if (_0x111EE[_0x112BD] != null) {
            _0x1128F.val(_0x112BD)
            _0x1128F.trigger("change")
        } else {
            _0x1128F.prop("selectedIndex", 0)
            _0x1128F.trigger("change")
        }
    }
    PlayerOneClient.prototype.handleCustomGameUpdate = function (_0x11233) {
        var _0x11205 = _0x11233.getUint8(_0x11233.offset++)
        switch (_0x11205) {
            case CustomGameUpdateType.MAP:
                ScrimmageHelper.updateMap(_0x11233.getUint8(_0x11233.offset++))
                break
            case CustomGameUpdateType.MODE:
                ScrimmageHelper.updateMode(_0x11233.getUint8(_0x11233.offset++))
                break
            case CustomGameUpdateType.SIZE:
                ScrimmageHelper.updateSize(_0x11233.getUint8(_0x11233.offset++))
                break
            case CustomGameUpdateType.STARTMASS:
                ScrimmageHelper.updateStartMass(_0x11233.getUint16(_0x11233.offset, true))
                _0x11233.offset += 2
                break
            case CustomGameUpdateType.LOCK:
                ScrimmageHelper.updateLock(_0x11233.getUint8(_0x11233.offset++) === 1 ? true : false)
                break
            case CustomGameUpdateType.PLAYER_UPDATE:
                var _0x111EE = _0x11233.getUint8(_0x11233.offset++)
                var _0x1121C = _0x11233.getUint8(_0x11233.offset++)
                player1.party[_0x111EE].team = _0x1121C
                ScrimmageHelper.updatePlayerById(_0x111EE)
                break
            case CustomGameUpdateType.PLAYER_LIST:
                var _0x111D7 = _0x11233.getUint8(_0x11233.offset++)
                var _0x111EE = 0
                while (_0x111D7 > 0) {
                    player1.party[_0x111EE].team = _0x11233.getUint8(_0x11233.offset++)
                    _0x111D7--
                    _0x111EE++
                }
                ScrimmageHelper.updatePlayers()
                break
            case CustomGameUpdateType.VIRUS_DENSITY:
                ScrimmageHelper.updateVirusDensity(_0x11233.getUint16(_0x11233.offset, true))
                _0x11233.offset += 2
                break
            case CustomGameUpdateType.RESPAWN_DELAY:
                ScrimmageHelper.updateRespawnDelay(_0x11233.getInt16(_0x11233.offset, true))
                _0x11233.offset += 2
                break
            case CustomGameUpdateType.AUTOSPLIT:
                ScrimmageHelper.updateAutoSplit(_0x11233.getUint8(_0x11233.offset++) === 1 ? true : false)
                break
            case CustomGameUpdateType.PUBLIC:
                ScrimmageHelper.updatePublic(_0x11233.getUint8(_0x11233.offset++) === 1 ? true : false)
                break
            case CustomGameUpdateType.PASSWORD:
                ScrimmageHelper.updatePassword(_0x11233.getUint8(_0x11233.offset++) === 1 ? true : false)
                break
            case CustomGameUpdateType.NAME:
                ScrimmageHelper.updateName(_0x122E9(_0x11233))
                break
        }
    }
    PlayerOneClient.prototype.handleCustomGameShow = function (_0x112EB) {
        $(".scrimmage-full").css("display", "none")
        $("#scrimmage-custom").css("display", "block")
        var _0x11261 = _0x122E9(_0x112EB)
        var _0x11233 = _0x112EB.getUint8(_0x112EB.offset++)
        var _0x1124A = _0x112EB.getUint8(_0x112EB.offset++)
        var _0x112BD = _0x112EB.getUint8(_0x112EB.offset++)
        var _0x112D4 = _0x112EB.getUint16(_0x112EB.offset, true)
        _0x112EB.offset += 2
        var _0x11302 = _0x112EB.getUint16(_0x112EB.offset, true)
        _0x112EB.offset += 2
        var _0x112A6 = _0x112EB.getInt16(_0x112EB.offset, true)
        _0x112EB.offset += 2
        var _0x111EE = _0x112EB.getUint8(_0x112EB.offset++) === 1 ? true : false
        var _0x1121C = _0x112EB.getUint8(_0x112EB.offset++) === 1 ? true : false
        var _0x1128F = _0x112EB.getUint8(_0x112EB.offset++) === 1 ? true : false
        var _0x11278 = _0x112EB.getUint8(_0x112EB.offset++) === 1 ? true : false
        var _0x111D7 = _0x112EB.getUint8(_0x112EB.offset++)
        var _0x11205 = 0
        while (_0x111D7 > 0) {
            player1.party[_0x11205].team = _0x112EB.getUint8(_0x112EB.offset++)
            _0x111D7--
            _0x11205++
        }
        ScrimmageHelper.updateName(_0x11261)
        ScrimmageHelper.updateMap(_0x11233)
        ScrimmageHelper.updateMode(_0x1124A)
        ScrimmageHelper.updateSize(_0x112BD)
        ScrimmageHelper.updateStartMass(_0x112D4)
        ScrimmageHelper.updateVirusDensity(_0x11302)
        ScrimmageHelper.updateLock(_0x1121C)
        ScrimmageHelper.updateRespawnDelay(_0x112A6)
        ScrimmageHelper.updateAutoSplit(_0x111EE)
        ScrimmageHelper.updatePublic(_0x1128F)
        ScrimmageHelper.updatePassword(_0x11278)
        ScrimmageHelper.updatePlayers()
        ScrimmageHelper.checkLeader()
    }
    PlayerOneClient.prototype.handleCustomGameLeave = function () {
        $(".scrimmage-full").css("display", "none")
        $("#scrimmage-menu").css("display", "block")
    }
    PlayerOneClient.prototype.handleShowCustomGameLobbies = function (_0x11233) {
        $(".scrimmage-full").css("display", "none")
        $("#scrimmage-lobbies").css("display", "block")
        _0x1173B = {}
        var _0x1121C = $("#scrimmage-lobbies-tbody")
        _0x1121C.empty()
        while (true) {
            var _0x11205 = _0x11233.getUint32(_0x11233.offset, true)
            _0x11233.offset += 4
            if (_0x11205 == 0) {
                break
            }
            var _0x111D7 = {}
            _0x111D7.id = _0x11205
            _0x111D7.name = _0x122E9(_0x11233)
            _0x111D7.leaderId = _0x11233.getUint32(_0x11233.offset)
            _0x11233.offset += 4
            _0x111D7.leaderName = _0x122E9(_0x11233) || "An unnamed cell"
            _0x111D7.map = _0x11233.getUint8(_0x11233.offset++)
            _0x111D7.mode = _0x11233.getUint8(_0x11233.offset++)
            _0x111D7.size = _0x11233.getUint16(_0x11233.offset, true)
            _0x11233.offset += 2
            _0x111D7.maxSize = _0x11233.getUint16(_0x11233.offset, true)
            _0x11233.offset += 2
            _0x111D7.hasPasscode = _0x11233.getUint8(_0x11233.offset++) == 1 ? true : false
            _0x1173B[_0x111D7.id] = _0x111D7
            var _0x111EE = _0x111D7.hasPasscode ? "<div class='scrimmage-lock'></div>" : ""
            _0x1121C.append("<tr partyId='" + _0x111D7.id + "'><td><span>" + _0x111EE + _0x111D7.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</span></td><td><span>" + _0x111D7.leaderName.replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</span></td><td><span>" + _0x123CF.maps[_0x111D7.map].name + "</span></td><td><span>" + _0x123CF.modes[_0x111D7.mode].name + "</span></td><td><span>" + _0x111D7.size + "/" + _0x111D7.maxSize + "</span></td></tr>")
        }
        $("#scrimmage-lobbies-tbody tr").on("click", function () {
            $(".custom-game-selected").removeClass("custom-game-selected")
            _0x12459 = $(this).attr("partyId")
            $(this).addClass("custom-game-selected")
        })
    }
    ScrimmageHelper = {
        updateName: function (_0x111D7) {
            $("#scrimmage-name").text(_0x111D7)
        },
        updateMap: function (_0x111EE) {
            $("#scrimmage-map option[value='" + _0x111EE + "']").prop("selected", true)
            var _0x11205 = _0x123CF.maps[_0x111EE]
            $("#scrimmage-mapmode").empty()
            for (var _0x111D7 = 0; _0x111D7 < _0x11205.modes.length; _0x111D7++) {
                var _0x1121C = _0x123CF.modes[_0x11205.modes[_0x111D7]]
                $("#scrimmage-mapmode").append("<option value='" + _0x111D7 + "'>" + _0x1121C.name + "</option>")
            }
            $("#scrimmage-mapsize").empty()
            for (var _0x111D7 = 0; _0x111D7 < _0x11205.sizes.length; _0x111D7++) {
                var _0x11233 = _0x123CF.sizes[_0x11205.sizes[_0x111D7]]
                $("#scrimmage-mapsize").append("<option value='" + _0x111D7 + "'>" + _0x11233.name + "</option>")
            }
            ScrimmageHelper.updateMode(0)
            ScrimmageHelper.updateSize(0)
            ScrimmageHelper.updateStartMass(_0x11205.startmass)
            $("#scrimmage-startmass").attr("placeholder", _0x11205.startmass)
            ScrimmageHelper.updateRespawnDelay(_0x11205.respawnDelay)
            $("#scrimmage-map").attr("data", _0x111EE)
            player1.customGameMap = _0x11205
        },
        updateMode: function (_0x111D7) {
            $("#scrimmage-mapmode option[value='" + _0x111D7 + "']").prop("selected", true)
            $("#scrimmage-mapmode").attr("data", _0x111D7)
        },
        updateSize: function (_0x111D7) {
            $("#scrimmage-mapsize option[value='" + _0x111D7 + "']").prop("selected", true)
            $("#scrimmage-mapsize").attr("data", _0x111D7)
        },
        updateStartMass: function (_0x111D7) {
            $("#scrimmage-startmass").val(_0x111D7)
            $("#scrimmage-startmass").attr("data", _0x111D7)
        },
        updateVirusDensity: function (_0x111D7) {
            $("#scrimmage-virusDensity").val(_0x111D7)
            $("#scrimmage-virusDensity").attr("data", _0x111D7)
        },
        updateRespawnDelay: function (_0x111D7) {
            $("#scrimmage-respawnDelay").val(_0x111D7)
            $("#scrimmage-respawnDelay").attr("data", _0x111D7)
        },
        updateAutoSplit: function (_0x111D7) {
            $("#scrimmage-autoSplit").prop("checked", _0x111D7)
        },
        updatePublic: function (_0x111D7) {
            $("#scrimmage-public").prop("checked", _0x111D7)
        },
        updatePassword: function (_0x111D7) {
            $("#scrimmage-password").prop("checked", _0x111D7)
        },
        updateLock: function (_0x111D7) {
            $("#scrimmage-lockteams").prop("checked", _0x111D7)
            ScrimmageHelper.checkLock()
        },
        checkLock: function () {
            if ($("#scrimmage-lockteams").prop("checked") && !player1.isPartyLeader()) {
                $("#cgp-" + player1.partyIndex).attr("disabled", "disabled")
            } else {
                $("#cgp-" + player1.partyIndex).removeAttr("disabled")
            }
        },
        checkLeader: function () {
            if (player1.isPartyLeader()) {
                $(".custom-game").removeAttr("disabled")
            } else {
                $(".custom-game").attr("disabled", "disabled")
                ScrimmageHelper.checkLock()
            }
        },
        updatePlayerById: function (_0x111D7) {
            var _0x111EE = player1.party[_0x111D7]
            $("#cgp-" + _0x111D7 + " option[value='" + _0x111EE.team + "']").prop("selected", true)
            $("#cgp-name-" + _0x111D7).text(_0x111EE.name)
            $("#cgp-name-" + _0x111D7).css("color", teamColors[_0x111EE.team])
        },
        updatePlayers: function () {
            $("#scrimmage-custom-players").empty()
            for (var _0x111D7 = 0; _0x111D7 < player1.party.length; _0x111D7++) {
                var _0x111EE = player1.party[_0x111D7]
                if (_0x111EE.id == player1.playerId) {
                    player1.partyIndex = _0x111D7
                }
                $("#scrimmage-custom-players").append("<tr><td><span id='cgp-name-" + _0x111D7 + "'>" + _0x111EE.name + "</span></td>" + ScrimmageHelper.getTeamOptions(_0x111D7, player1.customGameMap.teams) + "</tr>")
                $("#cgp-" + _0x111D7 + " option[value='" + _0x111EE.team + "']").prop("selected", true)
                $("#cgp-name-" + _0x111D7).css("color", teamColors[_0x111EE.team])
                $("#cgp-" + _0x111D7).on("change", function (_0x111EE) {
                    var _0x11205 = parseInt($(this).attr("id").match("\\d+")[0])
                    var _0x1121C = $(this).find("option:selected").val()
                    $("#cgp-" + _0x111D7 + " option[value='" + $(this).attr("data") + "']").prop("selected", true)
                    player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.PLAYER_UPDATE, _0x11205, _0x1121C))
                })
            }
            ScrimmageHelper.checkLeader()
        },
        getTeamOptions: function (_0x111EE, _0x1121C) {
            var _0x11205 = ""
            if (_0x1121C != null && _0x1121C > 1) {
                _0x11205 = "<td><select class='custom-game' id='cgp-" + _0x111EE + "'><option value='0'>Spectator</option>"
                for (var _0x111D7 = 1; _0x111D7 <= _0x1121C; _0x111D7++) {
                    _0x11205 += "<option value='" + _0x111D7 + "' class='t" + _0x111D7 + "'>" + Team[_0x111D7] + "</option>"
                }
                _0x11205 += "</select></td>"
            }
            return _0x11205
        }
    }
    /**
     * Represents a game cell entity
     * @param {number} id - The unique identifier for the cell
     * @param {any} options - Additional options for the cell
     */
    function GameCell(id, options) {
        this.id = id
        this.type = 0
        this.nameCache = null
        this.skin = null
        this.playerId = 0
        this.color = null
        this.x = 0
        this.y = 0
        this.x_ = 0
        // Target X position for animation
        this.y_ = 0
        // Target Y position for animation
        this.size = 0
        this.size_ = 0
        // Target size for animation
        this.steps = 0
        this.massLastAmount = -1
        this.cache = null
        this.originalAlpha = 1;
    }
    GameCell.prototype.setType = function (type) {
        this.type = type
    }

    /**
     * Set the X position of the cell (both current and target)
     * @param {number} x - The X position
     */
    GameCell.prototype.setX = function (x) {
        this.x_ = x
        this.x = x
    }

    /**
     * Set the Y position of the cell (both current and target)
     * @param {number} y - The Y position
     */
    GameCell.prototype.setY = function (y) {
        this.y_ = y
        this.y = y
    }

    /**
     * Update the target X position for animation
     * @param {number} x - The target X position
     */
    GameCell.prototype.updateX = function (x) {
        this.x_ = x
    }

    /**
     * Update the target Y position for animation
     * @param {number} y - The target Y position
     */
    GameCell.prototype.updateY = function (y) {
        this.y_ = y
    }

    /**
     * Set the size of the cell (both current and target)
     * @param {number} size - The size
     */
    GameCell.prototype.setSize = function (size) {
        this.size_ = size
        this.size = size
    }
    /**
     * Get the mass of the cell based on current size
     * @returns {number} The calculated mass
     */
    GameCell.prototype.getMass = function () {
        return ((this.size * this.size) / 25) >> 0
    }

    /**
     * Get the mass of the cell based on target size
     * @returns {number} The calculated mass
     */
    GameCell.prototype.getRealMass = function () {
        return ((this.size_ * this.size_) / 25) >> 0
    }

    /**
     * Animate the cell by interpolating between current and target positions/size
     * @param {number} delta - The time delta for animation
     */
    GameCell.prototype.animate = function (delta) {
        const MAX_INTERPOLATION_FACTOR = 0.3
        // Adjust this value (0.1 to 0.5 is typical)
        const effectiveDelta = Math.min(delta, MAX_INTERPOLATION_FACTOR)
        // Cap the delta used

        this.x += (this.x_ - this.x) * effectiveDelta
        // Use capped delta
        this.y += (this.y_ - this.y) * effectiveDelta
        // Use capped delta
        this.size += (this.size_ - this.size) * effectiveDelta
        // Use capped delta
        this.steps--
    }
    /**
     * Get the cached size display texture for the cell
     * @returns {PIXI.RenderTexture} The cached texture for the cell's mass display
     */
    GameCell.prototype.getSizeCache = function () {
        var mass = this.getMass()
        var massBitShift = Math.max(0, 26 - Math.clz32(mass))
        //highest 1 bit position - 6
        var massFirst6bit = mass >> massBitShift
        var cacheIndex = massFirst6bit | (massBitShift << 6)
        var tCache
        /*
         * We can assume biggest mass to be 16M = 24bit so massBitShift is from range 0-16
         * Other Than when then shift is 0, the 6th bit in massFirst6bit is always 1, which make each shift value 32 possible sub-index
         * From here we can calculate that the maximun cache size is about (17+1)*32 = 576
         */

        /* this makes it so only when mass changes about 1.5%~3% the mass cache will update*/
        if (globalSizeCache.has(cacheIndex)) {
            return globalSizeCache.get(cacheIndex)
        }
        var massText
        if (clientOptions.massType == 1) {
            massText = this.toShortString(mass)
        } else {
            massText = mass.toString()
        }

        var totalWidth = 0
        var maxHeight = 0
        for (var i = 0; i < massText.length; i++) {
            var char = massText.charAt(i)
            var numberTexture = sizeCache.getNumber(char)
            totalWidth += numberTexture.width - 2
            maxHeight = Math.max(numberTexture.height, maxHeight)
        }

        tCache = PIXI.RenderTexture.create(totalWidth, maxHeight)
        tCache.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR
        tCache.baseTexture.mipmap = PIXI.MIPMAP_MODES.OFF

        var container = sizeCache.cacheContainer
        var xPosition = 0
        for (var i = 0; i < massText.length; i++) {
            var char = massText.charAt(i)
            var sprite = sizeCache.getSizeCacheSprite()
            sprite.texture = sizeCache.getNumber(char).texture
            sprite.position.x = xPosition
            container.addChild(sprite)
            xPosition += sprite.width - 2
        }

        app.renderer.render(container, {
            renderTexture: tCache,
            clear: true
        })
        sizeCache.clearCacheContainer()
        this.massLastAmount = mass
        globalSizeCache.set(cacheIndex, tCache)
        return tCache
    }
    /**
     * Convert a number to a shortened string representation (e.g., 1.2K, 3.4M)
     * @param {number} num - The number to convert
     * @returns {string} The shortened string representation
     */
    GameCell.prototype.toShortString = function (num) {
        if (num < 1e3) {
            return num.toString()
        } else if (num < 1e6) {
            var value = Math.floor(num / 100) / 10
            return value.toFixed(1) + "K"
        } else if (num < 1e9) {
            var value = Math.floor(num / 1e5) / 10
            return value.toFixed(1) + "M"
        } else if (num >= 1e9) {
            var value = Math.floor(num / 1e8) / 10
            return value.toFixed(1) + "B"
        }

        return num.toString()
    }
    /**
     * SizeCache class for managing cell size display
     * Handles caching and rendering of cell mass numbers
     */
    function SizeCache() {
        this.cache = {}
        if (PIXI) {
            this.cacheContainer = new PIXI.Container()
        }
        this.sprites = []
        this.spritesIndex = 0

        /**
         * Get a cached number texture
         * @param {string} char - The character to get the texture for
         * @returns {PIXI.Text} The text object for the character
         */
        this.getNumber = function (char) {
            return this.cache[char]
        }

        /**
         * Clear the cache container
         */
        this.clearCacheContainer = function () {
            while (this.cacheContainer.children[0]) {
                this.cacheContainer.removeChild(this.cacheContainer.children[0])
            }

            this.spritesIndex = 0
        }

        /**
         * Get a sprite for the size cache
         * @returns {PIXI.Sprite} A sprite for displaying size
         */
        this.getSizeCacheSprite = function () {
            while (this.spritesIndex >= this.sprites.length) {
                this.sprites.push(new PIXI.Sprite())
            }

            return this.sprites[this.spritesIndex++]
        }

        /**
         * Build the size cache with all necessary characters
         */
        this.buildSizeCache = function () {
            var chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "K", "M", "B", "T"]
            for (var char of chars) {
                var text = new PIXI.Text(char, {
                    fontFamily: "Verdana",
                    fontWeight: "bold",
                    fontSize: 54,
                    fill: "#fff",
                    stroke: "black",
                    strokeThickness: clientOptions.textOutlineSize
                })
                this.cache[char] = text
            }
        }
    }
    const sizeCache = new SizeCache()
    /**
     * Handle food cell behavior
     */
    GameCell.prototype.handleFood = function () {
        // Early exit if halted - unchanged.

        // --- Update Visuals only if needed ---
        if (this.needsPixiUpdate && this.sprite.visible) {
            // --- Set Texture (Only if it could potentially change - unlikely for food) ---
            // If tempZ is *always* the food texture, this line could even be moved
            // to the initial creation of the food sprite. But keeping it here
            // harmlessly handles edge cases where it might somehow change.
            if (this.sprite.texture !== tempZ) {
                // Optimization: Check if needed
                this.sprite.texture = tempZ
                // Small circle texture (8px)
            }

            // --- Anchor & Size: MOVED ---
            // Optimization: These should be set ONCE when the sprite is created, not here.
            // Example (in cell creation code):
            // foodSprite.anchor.set(0.5);
            // foodSprite.width = 12;
            // foodSprite.height = 12;

            // --- Calculate Target Tint ---
            let targetTint
            // Optimization: Cache theme setting lookup if it doesn't change often within a frame
            const themeEnabled = clientSettings.cThemeEnabled
            const hasThemeColors = uiTheme._FoodColors.length > 0

            if (themeEnabled && hasThemeColors) {
                // Optimization: Cache uiTheme._FoodColors.length if it's static during the frame
                const numThemeColors = uiTheme._FoodColors.length
                targetTint = uiTheme._FoodColors[this.id % numThemeColors]
            } else {
                targetTint = this.color
            }

            // --- Set Tint (Only if it changed) ---
            // Optimization: Avoid setting the tint if it's already the correct value.
            if (this.sprite.tint !== targetTint) {
                this.sprite.tint = targetTint
            }

            // Reset the flag
            this.needsPixiUpdate = false
        }

        // --- Update Position ---
        // Optimization: Set position unconditionally. For numerous small objects where position
        // changes often, the cost of checking (if (this.sprite.x !== this.x || ...))
        // might outweigh the cost of just setting it. Profile if this becomes a bottleneck.
        this.sprite.position.set(this.x, this.y)

        // Alternative check (use if food positions are often static):
        // if (this.sprite.x !== this.x || this.sprite.y !== this.y) {
        //    this.sprite.position.set(this.x, this.y);
        // }
    }

    GameCell.prototype.handle = function (FM) {
        // Early exit if halted - unchanged, already good.

        // Optimization: Define constants or frequently accessed settings outside the switch if possible,
        // or ensure they are already efficiently cached elsewhere (like clientSettings).
        const isTransparent = clientSettings.cTransCells
        // Cache setting lookup
        const targetAlpha = isTransparent ? (this.originalAlpha * 0.5) : this.originalAlpha; // Use relative transparency based on originalAlpha

        // Optimization: Mipmap mode should ideally be set ONCE on the texture's baseTexture
        // when the texture is created/loaded, not every frame. Removed from here.
        // const mipmapMode = PIXI.MIPMAP_MODES.OFF; // REMOVED - Set this elsewhere

        switch (this.type) {
            case 0:
                // Food? Usually small and numerous. Assumed simple.
                // Optimization: Check if this case *really* needs any per-frame updates.
                // If food cells are static (only position changes), maybe only position needs updating.
                // Original code had nothing here, which is optimal if true.
                break

            case 1:
                // Ejected Mass?
                // --- Type 1 Optimizations ---
                if (this.needsPixiUpdate) {
                    let targetTexture = tempY
                    // Default medium circle
                    if (this.skin >= 0 && this.skin < array.length) {
                        // Assume _0x11866 is an array of textures
                        targetTexture = array[this.skin]
                    }
                    // Optimization: Only set texture if it actually changed
                    if (this.sprite.texture !== targetTexture) {
                        this.sprite.texture = targetTexture
                    }
                    // Optimization: Only set tint if it changed
                    if (this.sprite.tint !== this.color) {
                        this.sprite.tint = this.color
                    }
                    // Optimization: Only set alpha if it changed
                    if (this.sprite.alpha !== targetAlpha) {
                        this.originalAlpha = targetAlpha; // Update originalAlpha
                      
                        this.sprite.alpha = targetAlpha
                    }

                    const targetSize = this.size * 2
                    // Optimization: Only set width/height if they changed
                    if (this.sprite.width !== targetSize) {
                        this.sprite.width = targetSize
                        this.sprite.height = targetSize
                        // Assume square
                    }
                    this.needsPixiUpdate = false
                }

                // Optimization: Check rainbow outside needsPixiUpdate, but only set tint if needed.
                if (this.rainbow) {
                    const rainbowColor = colorValues[Math.floor((lastFrameTime % colorArrayLength) / 100)]
                    if (this.sprite.tint !== rainbowColor) {
                        this.sprite.tint = rainbowColor
                    }
                } else if (this.needsPixiUpdate === false && this.sprite.tint !== this.color) {
                    // Optimization: If rainbow was just turned off, ensure color resets.
                    // This check might be redundant if needsPixiUpdate handles the initial color correctly.
                    // Consider if `this.color` can change *without* `needsPixiUpdate` being true.
                    // If not, this 'else if' might be removable.
                    if (this.sprite.tint !== this.color) {
                        // Double check necessary?
                        this.sprite.tint = this.color
                    }
                }

                // Optimization: Only set position if it changed (if applicable, depends on how x/y are updated)
                // Assuming x/y *always* change or check is more expensive than set:
                this.sprite.position.set(this.x, this.y)
                // If x/y might not change, you could add:
                // if (this.sprite.x !== this.x || this.sprite.y !== this.y) {
                //     this.sprite.position.set(this.x, this.y);
                // }
                break

            case 2:
                // Player Cell
                // --- Type 2 Optimizations ---
                // Optimization: Cache player data lookup
                const playerData = FM.playerRegistry.getPlayerById(this.playerId)
                if (!playerData) return
                // Handle case where player might not be found

                let visibilityLevel = CellVisibility.ALL
                // Assume VIS_LEVEL is defined
                if (FM.playerId == this.playerId) {
                    visibilityLevel = CellVisibility.SELF
                } else if (FM.partyIds[this.playerId] != null) {
                    visibilityLevel = CellVisibility.PARTY
                }

                let needsVisualUpdate = this.needsPixiUpdate
                // Store original flag

                // --- Initialization Block (if needsPixiUpdate) ---
                if (needsVisualUpdate) {
                    // Optimization: Create sprites only ONCE. Use existing ones if they are already there.
                    // Assumes this.container is already created elsewhere.

                    if (!this.cellSprite) {
                        this.cellSprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
                        this.originalAlpha = this.cellSprite.alpha; // Initialize originalAlpha
                        // Use EMPTY initially
                        this.cellSprite.anchor.set(0.5)
                        // Set fixed size based on BASE_CELL_SIZE, scaling will handle apparent size
                        this.cellSprite.width = DOUBLE_CELL_SIZE
                        // Assume DOUBLE_CELL_SIZE = BASE_CELL_SIZE * 2
                        this.cellSprite.height = DOUBLE_CELL_SIZE
                        this.container.addChild(this.cellSprite)
                    }
                    // Reset texture here maybe? Or rely on the update logic below.
                    // this.cellSprite.texture = PIXI.Texture.EMPTY; // Example reset

                    if (!this.skinSprite) {
                        this.skinSprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
                        this.skinSprite.anchor.set(0.5)
                        this.skinSprite.width = DOUBLE_CELL_SIZE
                        this.skinSprite.height = DOUBLE_CELL_SIZE
                        this.container.addChild(this.skinSprite)
                    }
                    // Reset texture?
                    // this.skinSprite.texture = PIXI.Texture.EMPTY;

                    if (!this.massSprite) {
                        this.massSprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
                        // Mass anchor/position is set later based on name visibility
                        this.container.addChild(this.massSprite)
                    }
                    // Reset texture?
                    // this.massSprite.texture = PIXI.Texture.EMPTY;

                    // Optimization: Only create name sprite if needed AND it doesn't exist
                    if (playerData.name.length > 0) {
                        if (!this.nameSprite) {
                            this.nameSprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
                            // Name anchor/position set later
                            this.container.addChild(this.nameSprite)
                        }
                        // Reset texture?
                        // this.nameSprite.texture = PIXI.Texture.EMPTY;
                    } else if (this.nameSprite) {
                        // Optimization: Remove/hide name sprite if name is now empty and sprite exists
                        this.nameSprite.visible = false
                        // Optional: this.container.removeChild(this.nameSprite); this.nameSprite = null;
                    }

                    // Optimization: Create effect/debuff/shield sprites once if needed, then toggle visibility
                    // See creation logic further down.

                    this.needsPixiUpdate = false
                    // Reset flag after initial setup
                }
                // --- End Initialization Block ---

                // --- Per-Frame Update Block ---

                const playerCacheUpdated = playerData.cacheUpdate || needsVisualUpdate
                // Combine flags

                // --- Cell Background / Spikes / Mother ---
                if (playerCacheUpdated) {
                    // Only update texture/tint if cache changed or initial setup
                    let targetCellTexture = tempX
                    // Default: Large circle texture
                    let targetCellTint = playerData.cellColor
                    // Default: Player's base color
                    let targetCellAlpha = targetAlpha
                    // Use cached transparency setting
                    let isCustomTexture = false

                    if (playerData.spiked === 1) {
                        // Spike texture
                        targetCellTexture = customAssets.aCustomSpike || spikeTexture
                        targetCellTint = 0xffffff
                        // Spikes usually aren't tinted
                        targetCellAlpha = 1.0
                        // Spikes usually aren't transparent (override setting?) - adjust if needed
                        isCustomTexture = !!customAssets.aCustomSpike
                    } else if (playerData.spiked === 2) {
                        // Mother texture
                        targetCellTexture = customAssets.aCustomMother || motherCellTexture
                        targetCellTint = 0xffffff
                        // Mother usually aren't tinted
                        // targetCellAlpha = 1.0; // Mothers usually aren't transparent? - adjust if needed
                        isCustomTexture = !!customAssets.aCustomMother
                    } else {
                        // Regular cell background
                        targetCellTexture = tempX
                        // Base circle
                        // Check custom theme colors
                        if (clientSettings.cCustomCellColors) {
                            // Optimization: Parse colors ONCE when theme loads, store integers.
                            // Assuming uiTheme.player1CellColorParsed and uiTheme.player2CellColorParsed exist
                            if (this.playerId === player1.playerId && uiTheme.player1CellColorParsed !== undefined) {
                                targetCellTint = uiTheme.player1CellColorParsed
                            } else if (this.playerId === player2.playerId && uiTheme.player2CellColorParsed !== undefined) {
                                targetCellTint = uiTheme.player2CellColorParsed
                            } else {
                                targetCellTint = playerData.cellColor
                                // Fallback to player data color
                            }
                        } else {
                            targetCellTint = playerData.cellColor
                            // Use player data color if theme disabled
                        }
                        // Apply transparency only to regular cells
                        targetCellAlpha = targetAlpha
                    }

                    // Apply changes only if needed
                    if (this.cellSprite.texture !== targetCellTexture) {
                        this.cellSprite.texture = targetCellTexture
                    }
                    if (this.cellSprite.tint !== targetCellTint) {
                        this.cellSprite.tint = targetCellTint
                    }
                    if (this.cellSprite.alpha !== targetCellAlpha) {
                        this.originalAlpha = targetCellAlpha; // Update originalAlpha
                       
                        this.originalAlpha = targetCellAlpha; // Update originalAlpha
                        this.originalAlpha = targetCellAlpha; // Update originalAlpha
                        this.cellSprite.alpha = targetCellAlpha
                    }
                }

                // --- Skin Sprite ---
                const showSkin = clientOptions.levelSkins >= visibilityLevel && playerData.spiked === 0
                if (this.skinSprite.visible !== showSkin) {
                    this.skinSprite.visible = showSkin
                }

                if (showSkin) {
                    const skinTexture = playerData.getSkin()
                    // Assume getSkin() returns a PIXI.Texture or null/undefined
                    if (skinTexture) {
                        const finalSkinTexture = skinTexture.isGif ? skinTexture.getTexture() : skinTexture
                        // Handle GIFs if applicable
                        if (this.skinSprite.texture !== finalSkinTexture) {
                            this.skinSprite.texture = finalSkinTexture
                        }

                        // Handle transparency for skin and cell
                        if (clientSettings.cTransCells) {
                            // Set skin alpha to match cell alpha for transparency
                            if (this.skinSprite.alpha !== targetAlpha) {
                                // Skin should retain its original alpha when cTransCells is on
                                this.skinSprite.alpha = this.originalAlpha;
                            }

                            // Check if this is a PNG skin that might have transparent areas
                            const skinUrl = skinTexture.baseTexture?.imageUrl || '';
                            const isPngWithTransparency = skinUrl.toLowerCase().endsWith('.png');

                            if (isPngWithTransparency) {
                                // For PNG skins with potential transparency, keep cell visible but with reduced opacity
                                // This prevents the skin from becoming invisible in transparent areas
                                if (this.cellSprite.alpha !== targetAlpha) {
                                    this.originalAlpha = targetAlpha; // Update originalAlpha
                                   
                                  
                                    // Keep original alpha for cell background behind transparent PNG skin
                                    this.cellSprite.alpha = this.originalAlpha;
                                 }

                                // Make sure cell is visible and behind skin
                                if (!this.cellSprite.visible) {
                                    this.cellSprite.visible = true;
                                }
                            } else {
                                // For regular skins without transparency, hide the cell color completely
                                if (this.cellSprite.visible) {
                                    this.cellSprite.visible = false;
                                }
                            }

                            // Ensure cell is behind skin in the display list (if visible)
                            if (this.cellSprite.visible &&
                                this.container.children.indexOf(this.cellSprite) > this.container.children.indexOf(this.skinSprite)) {
                                this.container.swapChildren(this.cellSprite, this.skinSprite);
                            }
                        } else {
                            // Normal mode: show both cell and skin with full opacity
                            if (this.skinSprite.alpha !== 1) {
                                this.skinSprite.alpha = 1;
                            }
                            if (this.cellSprite.alpha !== 1) {
                                this.cellSprite.alpha = this.originalAlpha; // Restore original alpha
                             }
                             if (!this.cellSprite.visible) {
                                this.cellSprite.visible = true;
                            }
                            // Make sure cell is behind skin
                            if (this.container.children.indexOf(this.cellSprite) > this.container.children.indexOf(this.skinSprite)) {
                                this.container.swapChildren(this.cellSprite, this.skinSprite);
                            }
                        }
                    } else {
                        // No skin available, ensure sprite is hidden (already handled by visibility toggle above)
                        if (this.skinSprite.visible) this.skinSprite.visible = false
                        // Redundant safety check

                        // Make sure cell is visible when no skin is available
                        if (!this.cellSprite.visible) {
                            this.cellSprite.visible = true;
                        }
                    }
                } else {
                    // No skin shown, make sure cell is visible
                    if (!this.cellSprite.visible) {
                        this.cellSprite.visible = true;
                    }
                }
                // else: skinSprite visibility is already set to false

                // --- Name & Mass Calculations ---
                const scaleThreshold = 4 / this.size
                const massNameScale = Math.max(scaleThreshold, 0.16) * 4
                // Reuse calculation

                // Fix for dual mode: Use the correct scale for each player
                let scaleToUse = FM.scale;
                if (clientSettings.cDualMode) {
                    // If this is player1's cell, use player1's scale
                    if (this.playerId === player1.playerId) {
                        scaleToUse = player1.scale;
                    }
                    // If this is player2's cell, use player2's scale
                    else if (this.playerId === player2.playerId) {
                        scaleToUse = player2.scale;
                    }
                    // For other cells, use the active player's scale (FM.scale)
                }

                const showNameMass = scaleToUse >= scaleThreshold * 4 || clientSettings.cDisableAutoNameHiding
                // Check if name/mass should be potentially visible

                // --- Name Sprite ---
                if (this.nameSprite) {
                    // Check if name sprite exists
                    const showName = clientOptions.levelNames >= visibilityLevel && showNameMass
                    if (this.nameSprite.visible !== showName) {
                        this.nameSprite.visible = showName
                    }

                    if (showName) {
                        // Update texture only if needed (cache update or initial setup)
                        if (playerCacheUpdated) {
                            const nameCache = playerData.getNameCache(playerData.cacheUpdate)
                            // Pass flag if needed by cache func
                            if (nameCache && this.nameSprite.texture !== nameCache.texture) {
                                this.nameSprite.texture = nameCache.texture
                                // Optimization: texture.update() is often not needed if Pixi manages the texture source correctly.
                                // Remove unless you explicitly modify the *source* (like a Canvas) of the name texture elsewhere.
                                // this.nameSprite.texture.update(); // REMOVED (Potentially)
                            }
                        }

                        // Update scale and position only if needed
                        if (this.nameSprite.scale.x !== massNameScale) {
                            // Assuming uniform scale
                            this.nameSprite.scale.set(massNameScale)
                        }
                        // Calculate target Y position
                        const nameY =
                            playerData.lowerName ?
                                HALF_CELL_SIZE - this.nameSprite.height / 2 // Assumes HALF_CELL_SIZE is constant
                                : -(this.nameSprite.height / 2)
                        const nameX = -(this.nameSprite.width / 2)
                        // Re-calculate X based on current width after scale/texture change

                        if (this.nameSprite.x !== nameX || this.nameSprite.y !== nameY) {
                            this.nameSprite.position.set(nameX, nameY)
                        }

                        // --- Name Effect ---
                        // Optimization: Create effect sprite once, toggle visibility/texture
                        const showEffect = playerData.effect === 1 && _0x11F51[0] != null
                        // Assume _0x11F51 is an array of effects
                        if (showEffect) {
                            if (!this.nameEffectSprite) {
                                this.nameEffectSprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
                                this.nameSprite.addChild(this.nameEffectSprite)
                                // Add ONCE
                            }
                            if (!this.nameEffectSprite.visible) this.nameEffectSprite.visible = true

                            const effectTexture = _0x11F51[0].getTexture()
                            // Assume this gets the current frame/texture
                            if (this.nameEffectSprite.texture !== effectTexture) {
                                this.nameEffectSprite.texture = effectTexture
                            }
                            // Scale effect based on name texture dims (do only if needed)
                            // Optimization: Check if scale needs update
                            const targetEffectScaleX = this.nameSprite.texture.width / effectTexture.width
                            const targetEffectScaleY = this.nameSprite.texture.height / effectTexture.height
                            if (this.nameEffectSprite.scale.x !== targetEffectScaleX || this.nameEffectSprite.scale.y !== targetEffectScaleY) {
                                this.nameEffectSprite.scale.set(targetEffectScaleX, targetEffectScaleY)
                            }
                        } else if (this.nameEffectSprite && this.nameEffectSprite.visible) {
                            // Hide effect sprite if not needed
                            this.nameEffectSprite.visible = false
                        }
                    }
                    // End if (showName)
                }
                // End if (this.nameSprite)

                // --- Mass Sprite ---
                const showMass = (visibilityLevel <= clientOptions.levelMass || player1.serverData.autosplits) && showNameMass
                if (this.massSprite.visible !== showMass) {
                    this.massSprite.visible = showMass
                }

                if (showMass) {
                    // Optimization: Get size cache texture only when needed.
                    const massTexture = this.getSizeCache()
                    // Assume returns PIXI.Texture
                    if (this.massSprite.texture !== massTexture) {
                        this.massSprite.texture = massTexture
                    }
                    // Update scale only if needed
                    if (this.massSprite.scale.x !== massNameScale) {
                        // Assume uniform scale
                        this.massSprite.scale.set(massNameScale)
                    }

                    // Calculate target Y position based on name visibility
                    const massY =
                        this.nameSprite && this.nameSprite.visible ?
                            this.nameSprite.y + this.nameSprite.height // Position below name
                            : -(this.massSprite.height / 2)
                    // Center vertically if name hidden
                    const massX = -(this.massSprite.width / 2)
                    // Center horizontally

                    // Update position only if needed
                    if (this.massSprite.x !== massX || this.massSprite.y !== massY) {
                        this.massSprite.position.set(massX, massY)
                    }
                }
                // End if (showMass)

                // --- Cursor Line ---
                // Optimization: Reuse Graphics object or use a Sprite instead.
                const showCursorLine = clientSettings.cCursorLine && getActivePlayer().playerId === this.playerId
                if (showCursorLine) {
                    if (!this.cursorLine) {
                        // Option 1: Reuse Graphics (better than destroy/create)
                        this.cursorLine = new PIXI.Graphics()
                        this.container.addChild(this.cursorLine)
                        // Add ONCE

                        // // Option 2: Use Sprite (Often Faster for simple lines)
                        // this.cursorLine = new PIXI.Sprite(PIXI.Texture.WHITE); // Use 1x1 white texture
                        // this.cursorLine.anchor.set(0, 0.5); // Anchor at start, center vertically
                        // this.container.addChild(this.cursorLine);
                    }
                    if (!this.cursorLine.visible) this.cursorLine.visible = true

                    // Update the line (Option 1: Graphics)
                    const lineThickness = Math.max(1, 256 / this.size / player1.mouseZoom)
                    // Ensure minimum thickness
                    const targetX = ((lastMouseSendCoords.x - this.x) * 128) / this.size
                    // * 128? Check calculation
                    const targetY = ((lastMouseSendCoords.y - this.y) * 128) / this.size
                    this.cursorLine.clear()
                    // Clear previous drawing
                    this.cursorLine.lineStyle(lineThickness, 0xffffff, 1)
                    this.cursorLine.moveTo(0, 0)
                    this.cursorLine.lineTo(targetX, targetY)

                    // // Update the line (Option 2: Sprite)
                    // const lineThickness = Math.max(1, 256 / this.size / player1.mouseZoom);
                    // const dx = lastMouseSendCoords.x - this.x;
                    // const dy = lastMouseSendCoords.y - this.y;
                    // const len = Math.sqrt(dx*dx + dy*dy) * (128 / this.size); // Calculate scaled length
                    // const angle = Math.atan2(dy, dx); // Calculate angle
                    // if (this.cursorLine.width !== len) this.cursorLine.width = len;
                    // if (this.cursorLine.height !== lineThickness) this.cursorLine.height = lineThickness;
                    // if (this.cursorLine.rotation !== angle) this.cursorLine.rotation = angle;
                    // // Sprite position is (0,0) relative to container because anchor is (0, 0.5)
                } else if (this.cursorLine && this.cursorLine.visible) {
                    // Hide cursor line if not needed
                    this.cursorLine.visible = false
                    // // If using Graphics, clearing might be good practice
                    // this.cursorLine.clear();
                }

                // --- Debuff Sprite ---
                // Optimization: Create once, toggle visibility
                const showCosmetic = clientSettings.sCosmetic!="None" && getActivePlayer().playerId === this.playerId;
                if (showCosmetic) {
                    if (!this.crownGraphic||clientSettings.sCosmetic!=this.currentCosGraphic) {
                        if(this.crownGraphic){
                            this.container.removeChild(this.crownGraphic);
                            this.crownGraphic.destroy();
                        }
                        if(clientSettings.sCosmetic=="Crown"){
                            const crownTexture = PIXI.Texture.from('https://i.imgur.com/koZOi3M.png');
                            this.crownGraphic = new PIXI.Sprite(crownTexture);
                            this.crownGraphic.anchor.set(0.5, 1.25);
                            this.crownGraphic.scale.x = 0.1;
                            this.crownGraphic.scale.y = 0.1;
                        }
                        if(clientSettings.sCosmetic=="Cat"){
                            const catTexture = PIXI.Texture.from('https://i.imgur.com/JoGccdo.png');
                            this.crownGraphic = new PIXI.Sprite(catTexture);
                            this.crownGraphic.anchor.set(0.5, 0.4);
                            this.crownGraphic.scale.x = 0.8;
                            this.crownGraphic.scale.y = 0.8;
                        }
                        console.log(clientSettings.sCosmetic)
                        this.container.addChild(this.crownGraphic);
                        this.currentCosGraphic=clientSettings.sCosmetic
                    }
                    if (!this.crownGraphic.visible) {
                        this.crownGraphic.visible = true;
                    }
                    this.crownGraphic.x = 0;
                    this.crownGraphic.y = -this.cellSprite.y;
                }else{
                    if (this.crownGraphic && this.crownGraphic.visible) {
                        this.crownGraphic.visible = false;
                        this.currentCosGraphic="None"
                    }
                }
                const showDebuff = (playerData.flags & 4) === 4
                // Use bitwise AND
                if (showDebuff) {
                    if (!this.debuffSprite) {
                        this.debuffSprite = new PIXI.Sprite(_0x12203)
                        // Assume _0x12203 is the texture
                        this.debuffSprite.anchor.set(0.5)
                        // Set size based on constants - Assuming CELL_BORDER_SIZE is fixed relative to base size
                        this.debuffSprite.width = CELL_BORDER_SIZE
                        this.debuffSprite.height = CELL_BORDER_SIZE
                        this.container.addChild(this.debuffSprite)
                        // Add ONCE
                    }
                    if (!this.debuffSprite.visible) this.debuffSprite.visible = true
                } else if (this.debuffSprite && this.debuffSprite.visible) {
                    this.debuffSprite.visible = false
                }

                // --- Shield Sprite ---
                // Optimization: Create once, toggle visibility
                const showShield = (playerData.flags & 1) === 1
                // Use bitwise AND
                if (showShield) {
                    if (!this.shieldSprite) {
                        this.shieldSprite = new PIXI.Sprite(_0x1221A)
                        // Assume _0x1221A is the texture
                        this.shieldSprite.anchor.set(0.5)
                        // Set size based on constants
                        this.shieldSprite.width = CELL_BORDER_SIZE
                        this.shieldSprite.height = CELL_BORDER_SIZE
                        this.container.addChild(this.shieldSprite)
                        // Add ONCE
                    }
                    if (!this.shieldSprite.visible) this.shieldSprite.visible = true
                } else if (this.shieldSprite && this.shieldSprite.visible) {
                    this.shieldSprite.visible = false
                }

                // --- Container Scaling & Positioning ---
                const targetScale = this.size / BASE_CELL_SIZE
                // Optimization: Only set scale if it changed
                if (this.container.scale.x !== targetScale) {
                    // Assuming uniform scale
                    this.container.scale.set(targetScale)
                }
                // Optimization: Only set position if it changed (assuming x/y might not change every frame)
                if (this.container.x !== this.x || this.container.y !== this.y) {
                    this.container.position.set(this.x, this.y)
                }
                // If position always changes, the check can be removed:
                // this.container.position.set(this.x, this.y);

                break
            // End Case 2

            case 3:
                // Virus
                // --- Type 3 Optimizations ---
                if (this.needsPixiUpdate) {
                    // Setup block (anchor, initial texture, alpha) - run only once essentially
                    this.sprite.anchor.set(0.5)
                    // Set anchor once

                    const targetTexture = customAssets.aCustomSpike || spikeTexture
                    if (this.sprite.texture !== targetTexture) {
                        this.sprite.texture = targetTexture
                    }
                    // Fixed base size? Original code sets 128 here, then scales below.
                    // This seems odd. Usually, you'd let the texture define base size.
                    // If 128x128 is NOT the texture's natural size, this distorts it before scaling.
                    // Let's assume the texture IS 128x128 or scaling below handles it.
                    // this.sprite.width = 128; // Maybe remove?
                    // this.sprite.height = 128; // Maybe remove?

                    if (this.sprite.alpha !== targetAlpha) {
                        this.originalAlpha = targetAlpha; // Update originalAlpha
                       
                        this.sprite.alpha = targetAlpha
                    }
                    this.needsPixiUpdate = false
                }

                // Per-frame update (scale, position)
                const virusScale = this.size / 256
                // Scaling based on 256? Check if this base is correct for the texture.
                if (this.sprite.scale.x !== virusScale) {
                    // Assuming uniform scale
                    this.sprite.scale.set(virusScale)
                }
                if (this.sprite.x !== this.x || this.sprite.y !== this.y) {
                    this.sprite.position.set(this.x, this.y)
                }
                break

            case 4:
                // Mother Cell
                // --- Type 4 Optimizations ---
                if (this.needsPixiUpdate) {
                    let motherTexture = customAssets.aCustomMother || motherCellTexture
                    // Base texture

                    // Event skin logic - needs careful checking
                    let applyEventLogic = eventSettings.enabled && eventSettings.motherCustomEnabled && !clientSettings.cDisableEventSkins && !customAssets.aCustomMother

                    if (applyEventLogic) {
                        // Call custom function - ensure eventSettings.motherCustom is efficient
                        // and ideally sets texture directly if possible.
                        eventSettings.motherCustom(this)
                        // This might set texture/anchor itself
                    } else {
                        // Default texture/anchor logic if no event or custom asset used
                        if (this.sprite.texture !== motherTexture) {
                            this.sprite.texture = motherTexture
                        }
                        this.setDefaultSpriteAnchor()
                        // Ensure anchor is set correctly
                    }

                    // Common setup for type 4
                    if (this.sprite.alpha !== targetAlpha) {
                        this.originalAlpha = targetAlpha; // Update originalAlpha
                        
                        
                        this.sprite.alpha = targetAlpha
                    }
                    this.needsPixiUpdate = false
                }

                // Per-frame updates (texture swap, scale, position)
                // Handle happy mother texture swap outside needsPixiUpdate
                if (!customAssets.aCustomMother && eventSettings.enabled && !clientSettings.cDisableEventSkins) {
                    const targetTexture = this.size >= 100 ? happyMotherCellTexture : motherCellTexture
                    if (this.sprite.texture !== targetTexture) {
                        this.sprite.texture = targetTexture
                    }
                }
                // else: texture set during needsPixiUpdate or by event logic remains

                const motherScale = this.size / 256
                // Scaling base 256 again
                if (this.sprite.scale.x !== motherScale) {
                    // Assume uniform scale
                    this.sprite.scale.set(motherScale)
                }
                if (this.sprite.x !== this.x || this.sprite.y !== this.y) {
                    this.sprite.position.set(this.x, this.y)
                }
                break

            case 5:
                // Powerup
                // --- Type 5 Optimizations ---
                if (this.needsPixiUpdate) {
                    // Assume powerupDefinitions[this.buff].texture gives the correct texture
                    const targetTexture = powerupDefinitions[this.buff].texture
                    if (this.sprite.texture !== targetTexture) {
                        this.sprite.texture = targetTexture
                    }

                    const powerupSize = this.size * 2
                    if (this.sprite.width !== powerupSize) {
                        this.sprite.width = powerupSize
                        this.sprite.height = powerupSize
                        // Assume square
                    }
                    if (this.sprite.alpha !== targetAlpha) {
                        this.sprite.alpha = targetAlpha
                    }
                    this.needsPixiUpdate = false
                }

                // Per-frame update (position only?)
                if (this.sprite.x !== this.x || this.sprite.y !== this.y) {
                    this.sprite.position.set(this.x, this.y)
                }
                break
        }
        // End Switch
    }
    // End Function

    GameCell.prototype.setDefaultSpriteAnchor = function () {
        this.sprite.anchor.set(0.5)
        this.sprite.width = 128
        this.sprite.height = 128
    }
    /**
     * Called when the cell is created
     * @param {any} data - The creation data
     */
    GameCell.prototype.onCreate = function (data) {
        if (this.type == 2) {
            if (this.container) {
                return
            }
            this.container = new PIXI.Container()
            this.container.parentCell = this
            this.needsPixiUpdate = true
            cellContainer.addChild(this.container)
        } else {
            if (this.sprite) {
                return
            }
            this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY)
            this.originalAlpha = this.sprite.alpha; // Initialize originalAlpha
            this.sprite.parentCell = this
            this.sprite.anchor.set(0.5)

            // --- OPTIMIZATION: Add specific setup for Food (Type 6) ---
            if (this.type === 6) {
                // Or check for food type 0 if applicable
                this.sprite.width = 12
                this.sprite.height = 12
                // Optional: Set initial texture if not using EMPTY placeholder?
                // this.sprite.texture = tempZ; // If tempZ is available here
            }

            this.needsPixiUpdate = true
            if (this.type != 0) {
                cellContainer.addChild(this.sprite)
            } else {
                foodContainer.addChild(this.sprite)
            }
        }
        if (this.type == 6) {
            // _0x111D7.foodObjects[this.id] = this; // BEFORE
            data.foodObjects.set(this.id, this)
            // AFTER
        } else {
            // _0x111D7.bucket[this.id] = this; // BEFORE
            data.bucket.set(this.id, this)
            // AFTER
        }
        if (this.playerId == data.playerId) {
            data.myCells[this.id] = this
            // myCells remains an object
        }
    }
    /**
     * Called when the cell is deleted
     */
    GameCell.prototype.onDelete = function () {
        if (this.container) {
            this.container.parent.removeChild(this.container)
            this.container.parentCell = null
            this.container.destroy({
                children: true
            })
            this.container = null
        } else {
            if (this.sprite) {
                this.sprite.parent.removeChild(this.sprite)
                this.sprite.parentCell = null
                this.sprite.destroy({
                    children: true
                })
                this.sprite = null
            }
        }
        if (this.cache) {
            this.cache.destroy()
            this.cache = null
        }
    }
    /**
     * PlayerRegistry class for managing player data
     * Handles storing, retrieving, and updating player information
     */
    function PlayerRegistry() {
        this.bucket = new Map()
        // Map of player IDs to player data
        this.defaultData
        // Default player data
        this.updatedPlayers = []
        // List of players that need updates

        /**
         * Initialize the player registry
         */
        this.init = function () {
            this.defaultData = new PlayerData(0)
            this.defaultData.name = ""
            this.defaultData.cellColor = 11184810
        }

        /**
         * Add a player to the registry
         * @param {PlayerData} player - The player to add
         */
        this.add = function (player) {
            this.bucket.set(player.id, player)
        }

        /**
         * Remove a player from the registry
         * @param {number} playerId - The ID of the player to remove
         */
        this.remove = function (playerId) {
            // Find the player object first if needed for onDelete
            const player = this.bucket.get(playerId)
            if (player) {
                player.onDelete()
            }
            this.bucket.delete(playerId)
        }

        /**
         * Clear all players from the registry
         */
        this.clear = function () {
            for (const player of this.bucket.values()) {
                player.onDelete()
            }
            this.bucket.clear()
        }

        /**
         * Get a player by ID
         * @param {number} playerId - The ID of the player to get
         * @returns {PlayerData|undefined} The player data or undefined if not found
         */
        this.getPlayer = function (playerId) {
            return this.bucket.get(playerId)
        }

        /**
         * Get a player by ID, returning default data if not found
         * @param {number} playerId - The ID of the player to get
         * @returns {PlayerData} The player data or default data if not found
         */
        this.getPlayerById = function (playerId) {
            var player = this.bucket.get(playerId)
            return player != null ? player : this.defaultData
        }

        /**
         * Mark a player as needing an update
         * @param {PlayerData} player - The player to update
         */
        this.updatePlayer = function (player) {
            player.cacheUpdate = true
            this.updatedPlayers.push(player)
        }

        /**
         * Process all players that need updates
         */
        this.handleUpdatedPlayers = function () {
            while (this.updatedPlayers.length > 0) {
                var player = this.updatedPlayers.shift()
                player.cacheUpdate = false
            }
        }
        this.init()
    }
    /**
     * PlayerData class for storing player information
     * @param {number} id - The player ID
     */
    function PlayerData(id) {
        this.id = id
        this.name
        // Player name
        this.skin
        // Player skin URL
        this.skinCache
        // Cached skin texture
        this.cellColor
        // Cell color
        this.nameColor = "#fff"
        // Name color
        this.skinHasTransparency = false // Flag for inherent skin alpha
        this.flags = 0
        // Player flags
        this.effect = 0
        // Visual effect
        this.nameFont = 0
        // Font for name display
        this.lowerName = false
        // Whether to display name below cell
        this.nameCache = null
        // Cached name texture
        this.cacheUpdate = false
        // Whether cache needs updating
        this.spiked = 0
        // Whether player is spiked
        this.setFlags = function (_0x111D7) {
            this.flags = _0x111D7
            if ((this.flags & 8) == 8) {
                this.spiked = 1
            } else {
                if ((this.flags & 16) == 16) {
                    this.spiked = 2
                } else {
                    this.spiked = 0
                }
            }
        }
        this.parseEffect = function (_0x111D7) {
            if (_0x111D7 >= 64) {
                _0x111D7 -= 64
                this.lowerName = true
            } else {
                this.lowerName = false
            }
            this.effect = _0x111D7
        }
        this.getNameCache = function (_0x111D7) {
            if (_0x111D7 || this.nameCache == null) {
                var _0x111EE = _0x11A04(this.nameFont)
                var _0x1121C, _0x11205
                if (_0x111EE == _0x11780) {
                    _0x1121C = "bold"
                    _0x11205 = clientOptions.textOutlineSize
                } else {
                    _0x1121C = "normal"
                    _0x11205 = 9
                }
                if (!this.nameCache) {
                    this.nameCache = new PIXI.Text(this.name, {
                        fontFamily: _0x111EE.font,
                        fontWeight: _0x1121C,
                        fontSize: _0x111EE.size,
                        fill: this.nameColor,
                        stroke: _0x111EE.outlineColor,
                        strokeThickness: _0x11205
                    })
                } else {
                    this.nameCache.text = this.name
                    this.nameCache.style.fontFamily = _0x111EE.font
                    this.nameCache.style.stroke = _0x111EE.outlineColor
                    this.nameCache.style.fontWeight = _0x1121C
                    this.nameCache.style.fontSize = _0x111EE.size
                    this.nameCache.style.fill = this.nameColor
                    this.nameCache.updateText()
                }
                this.nameCache.width
            }
            return this.nameCache
        }
        this.setSkin = function (_0x111D7) {
            if (_0x111D7.length == 0) {
                this.skin = null
                this.skinCache = null
            } else {
                if (_0x111D7 !== this.skin) {
                    this.skin = _0x111D7
                    this.skinCache = null
                }
            }
        }
        this.getSkin = function () {
            if (this.skinCache != null) {
                return this.skinCache
            }
            if (this.skin != null) {
                if (!skinLoadingStatus[this.skin]) {
                    skinLoadingStatus[this.skin] = SKIN_LOAD_STATUS.LOADING
                    if (this.skin.endsWith(".gif")) {
                        var _0x11205 = this.skin
                        var _0x111D7 = this
                        gifFrames({
                            url: _0x11205,
                            frames: "all",
                            cumulative: false,
                            outputType: "canvas"
                        })
                            .then(function (_0x111D7) {
                                var gifTexture = new GifTexture()
                                gifTexture.loadFromFrameData(_0x111D7)
                                skinLoadingStatus[_0x11205] = SKIN_LOAD_STATUS.LOADED
                                skinTextureCache[_0x11205] = gifTexture
                            })
                            .catch(function (_0x111EE) {
                                _0x111D7.skin = null
                            })
                    } else {
                        var _0x111EE = new Image()
                        _0x111EE.crossOrigin = ""
                        var _0x11205 = this.skin
                        _0x111EE.addEventListener("load", function () {
                            var _0x111D7 = document.createElement("canvas")
                            _0x111D7.width = 512
                            _0x111D7.height = 512
                            var _0x1121C = _0x111D7.getContext("2d")
                            _0x1121C.beginPath()
                            _0x1121C.arc(256, 256, 256, 0, TWO_PI, false)
                            _0x1121C.closePath()
                            _0x1121C.clip()
                            _0x1121C.drawImage(_0x111EE, 0, 0, 512, 512)
                            var _0x11233 = PIXI.Texture.from(_0x111D7)
                            skinLoadingStatus[_0x11205] = SKIN_LOAD_STATUS.LOADED
                            skinTextureCache[_0x11205] = _0x11233
                        })
                        _0x111EE.addEventListener("error", function () {
                            skinLoadingStatus[_0x11205] = SKIN_LOAD_STATUS.ERROR
                        })
                        _0x111EE.src = _0x11205
                    }
                } else {
                    if (skinLoadingStatus[this.skin] == SKIN_LOAD_STATUS.LOADED) {
                        this.skinCache = skinTextureCache[this.skin]
                        return this.skinCache
                    } else {
                        if (skinLoadingStatus[this.skin] == SKIN_LOAD_STATUS.ERROR) {
                            this.skin = null
                        }
                    }
                }
            }
            return null
        }
        this.onDelete = function () {
            if (this.nameCache) {
                this.nameCache.destroy()
            }
        }
    }
    /**
     * NetworkProtocol class for handling network communication
     */
    class NetworkProtocol {
        constructor() {
            // No initialization needed
        }
    }

    /**
     * Creates the initial connection packet with version information
     * @returns {ArrayBuffer} The formatted connection packet
     */
    NetworkProtocol.prototype.connectionStart = function () {
        var clientVersion = "Gota Web " + version
        var buffer = new ArrayBuffer(1 + clientVersion.length + 1 + 1)
        var dataView = new DataView(buffer)
        dataView.setUint8(0, 255)
        dataView.setUint8(1, 6)
        writeAsciiString(2, dataView, clientVersion)
        return buffer
    }
    /**
     * Creates a packet to set the player's name
     * @param {string} playerName - The name to set for the player
     * @returns {ArrayBuffer} The formatted name packet
     */
    NetworkProtocol.prototype.setName = function (playerName) {
        var buffer = new ArrayBuffer(2 + (playerName.length + 1) * 2)
        var dataView = new DataView(buffer)

        // Packet type: set name (0)
        dataView.setUint8(0, 0)

        // Write the player name as UTF-16
        writeUtf16String(1, dataView, playerName)

        // Add silent login flag if enabled
        if (clientSettings.cSilentLogin) {
            dataView.setUint8(2 + playerName.length * 2 + 1, 1)
        }
        return buffer
    }
    /**
     * Creates a packet to send a key command to the server
     * @param {number} keyCode - The key code to send
     * @returns {ArrayBuffer} The formatted key packet
     */
    NetworkProtocol.prototype.sendKey = function (keyCode) {
        var buffer = new ArrayBuffer(1)
        var dataView = new DataView(buffer)
        dataView.setUint8(0, keyCode)
        return buffer
    }
    /**
     * Creates a packet to send mouse position to the server
     * @param {number} mouseX - The X coordinate of the mouse
     * @param {number} mouseY - The Y coordinate of the mouse
     * @returns {ArrayBuffer} The formatted mouse position packet
     */
    NetworkProtocol.prototype.sendMouse = function (mouseX, mouseY) {
        var buffer = new ArrayBuffer(9)
        var dataView = new DataView(buffer)

        // Packet type: mouse position (16)
        dataView.setUint8(0, 16)

        // Mouse X and Y coordinates
        dataView.setInt32(1, mouseX, true)
        dataView.setInt32(5, mouseY, true)

        return buffer
    }
    /**
     * Creates a packet to send eject mass command to the server
     * @param {boolean} isEjecting - Whether ejecting is active or not
     * @returns {ArrayBuffer} The formatted eject mass packet
     */
    NetworkProtocol.prototype.sendEjectMass = function (isEjecting) {
        var buffer = new ArrayBuffer(1)
        var dataView = new DataView(buffer)

        // Packet type: eject mass (3) or stop ejecting (4)
        dataView.setUint8(0, isEjecting ? 3 : 4)

        return buffer
    }
    /**
     * Creates a packet to send a ping to the server
     * @returns {ArrayBuffer} The formatted ping packet
     */
    NetworkProtocol.prototype.sendPing = function () {
        var buffer = new ArrayBuffer(1)
        var dataView = new DataView(buffer)

        // Packet type: ping (71)
        dataView.setUint8(0, 71)

        return buffer
    }
    /**
     * Creates a packet to enter spectate mode
     * @param {number} playerId - The ID of the player to spectate (0 for free spectate)
     * @returns {ArrayBuffer} The formatted spectate packet
     */
    NetworkProtocol.prototype.sendSpectate = function (playerId) {
        var buffer = new ArrayBuffer(3)
        var dataView = new DataView(buffer)

        // Packet type: spectate (1)
        dataView.setUint8(0, 1)

        // Player ID to spectate (if provided)
        if (playerId) {
            dataView.setUint16(1, playerId, true)
        }

        return buffer
    }
    /**
     * Creates a packet to send a chat message
     * @param {string} message - The chat message to send
     * @param {number} chatType - The type of chat message (0=all, 1=party)
     * @returns {ArrayBuffer} The formatted chat packet
     */
    NetworkProtocol.prototype.sendChat = function (message, chatType) {
        var buffer = new ArrayBuffer(2 + (message.length + 1) * 2)
        var dataView = new DataView(buffer)

        // Packet type: chat message (72)
        dataView.setUint8(0, 72)

        // Chat type (0=all, 1=party)
        dataView.setUint8(1, chatType)

        // Write the message as UTF-16
        writeUtf16String(2, dataView, message)

        return buffer
    }
    /**
     * Creates a packet to respond to a party invitation
     * @param {boolean} accept - Whether to accept (true) or decline (false) the invitation
     * @returns {ArrayBuffer} The formatted invitation response packet
     */
    NetworkProtocol.prototype.sendInviteResponse = function (accept) {
        var buffer = new ArrayBuffer(2)
        var dataView = new DataView(buffer)

        // Packet type: invitation response (41)
        dataView.setUint8(0, 41)

        // Response: 1 = accept, 0 = decline
        dataView.setUint8(1, accept ? 1 : 0)

        return buffer
    }
    /**
     * Creates a packet to perform a party action
     * @param {number} actionType - The type of party action to perform
     * @param {number} targetId - The ID of the player to target with the action
     * @returns {ArrayBuffer} The formatted party action packet
     */
    NetworkProtocol.prototype.sendPartyAction = function (actionType, targetId) {
        var buffer = new ArrayBuffer(6)
        var dataView = new DataView(buffer)

        // Packet type: party action (40)
        dataView.setUint8(0, 40)

        // Action type
        dataView.setUint8(1, actionType)

        // Target player ID
        dataView.setUint32(2, targetId, true)

        return buffer
    }
    /**
     * Creates a packet to join a party using a code
     * @param {string} partyCode - The code of the party to join
     * @returns {ArrayBuffer} The formatted party join packet
     */
    NetworkProtocol.prototype.sendPartyJoin = function (partyCode) {
        var buffer = new ArrayBuffer(1 + partyCode.length + 1)
        var dataView = new DataView(buffer)

        // Packet type: join party (42)
        dataView.setUint8(0, 42)

        // Write the party code as ASCII
        writeAsciiString(1, dataView, partyCode)

        return buffer
    }
    /**
     * Creates a packet to request a player's profile
     * @param {number} playerId - The ID of the player whose profile to show
     * @returns {ArrayBuffer} The formatted show profile packet
     */
    NetworkProtocol.prototype.sendShowProfile = function (playerId) {
        var buffer = new ArrayBuffer(3)
        var dataView = new DataView(buffer)

        // Packet type: show profile (103)
        dataView.setUint8(0, 103)

        // Player ID to show profile for
        dataView.setUint16(1, playerId, true)

        return buffer
    }
    /**
     * Creates a packet to send a whisper message to a player
     * @param {number} playerId - The ID of the player to whisper to
     * @param {string} message - The message to send
     * @returns {ArrayBuffer} The formatted whisper packet
     */
    NetworkProtocol.prototype.sendWhisper = function (playerId, message) {
        var buffer = new ArrayBuffer(5 + (message.length + 1) * 2)
        var dataView = new DataView(buffer)

        // Packet type: whisper (73)
        dataView.setUint8(0, 73)

        // Target player ID
        dataView.setUint32(1, playerId, true)

        // Write the message as UTF-16
        writeUtf16String(5, dataView, message)

        return buffer
    }
    /**
     * Creates a packet to send subpanel settings to the server
     * @returns {ArrayBuffer} The formatted subpanel settings packet
     */
    NetworkProtocol.prototype.sendSubPanel = function () {
        var buffer = new ArrayBuffer(8 + (subPanelSettings.skinName.length + 1))
        var dataView = new DataView(buffer)

        // Packet type: subpanel settings (10)
        dataView.setUint8(0, 10)

        // RGB color values for name
        dataView.setUint8(1, subPanelSettings.nameColor.r)
        dataView.setUint8(2, subPanelSettings.nameColor.g)
        dataView.setUint8(3, subPanelSettings.nameColor.b)

        // Chat color
        dataView.setUint8(4, subPanelSettings.chatColor)

        // Name effect
        dataView.setUint8(5, subPanelSettings.effect)

        // Lower case name flag
        dataView.setUint8(6, subPanelSettings.lowerName ? 1 : 0)

        // Skin name as ASCII
        writeAsciiString(7, dataView, subPanelSettings.skinName)

        // Name font
        dataView.setUint8(8 + subPanelSettings.skinName.length, subPanelSettings.nameFont)

        return buffer
    }
    /**
     * Creates a packet to change the player's locked name
     * @param {string} newName - The new locked name to set
     * @returns {ArrayBuffer} The formatted locked name change packet
     */
    NetworkProtocol.prototype.sendLockedNameChange = function (newName) {
        var buffer = new ArrayBuffer(1 + (newName.length + 1))
        var dataView = new DataView(buffer)

        // Packet type: locked name change (11)
        dataView.setUint8(0, 11)

        // Write the new name as ASCII
        writeAsciiString(1, dataView, newName)

        return buffer
    }
    /**
     * Creates a packet to send client options to the server
     * @returns {ArrayBuffer} The formatted options packet
     */
    NetworkProtocol.prototype.sendOptions = function () {
        var buffer = new ArrayBuffer(3)
        var dataView = new DataView(buffer)

        // Packet type: options (104)
        dataView.setUint8(0, 104)

        // View distance setting
        dataView.setUint16(1, clientSettings.rViewDistance, true)

        return buffer
    }
    /**
     * Creates a packet to send additional client options to the server
     * @returns {ArrayBuffer} The formatted additional options packet
     */
    NetworkProtocol.prototype.sendOptions2 = function () {
        var buffer = new ArrayBuffer(3)
        var dataView = new DataView(buffer)

        // Packet type: additional options (104)
        dataView.setUint8(0, 104)

        // Fixed view distance value
        dataView.setUint16(1, 200, true)

        return buffer
    }
    /**
     * Creates a packet to join a queue for matchmaking
     * @param {number} queueId - The ID of the queue to join
     * @returns {ArrayBuffer} The formatted queue packet
     */
    NetworkProtocol.prototype.sendQueue = function (queueId) {
        var buffer = new ArrayBuffer(5)
        var dataView = new DataView(buffer)

        // Packet type: queue (80)
        dataView.setUint8(0, 80)

        // Queue ID to join
        dataView.setUint8(1, queueId)

        // Reserved bytes (set to 0)
        dataView.setUint8(2, 0)
        dataView.setUint16(3, 0)

        return buffer
    }
    /**
     * Creates a packet to create or join a custom game
     * @param {number} gameType - The type of custom game action
     * @returns {ArrayBuffer} The formatted custom game packet
     */
    NetworkProtocol.prototype.sendCustomGame = function (gameType) {
        var buffer = new ArrayBuffer(2)
        var dataView = new DataView(buffer)

        // Packet type: custom game (90)
        dataView.setUint8(0, 90)

        // Game type/action
        dataView.setUint8(1, gameType)

        return buffer
    }
    /**
     * Creates a packet to leave the current match
     * @returns {ArrayBuffer} The formatted leave match packet
     */
    NetworkProtocol.prototype.sendLeaveMatch = function () {
        var buffer = new ArrayBuffer(1)
        var dataView = new DataView(buffer)

        // Packet type: leave match (81)
        dataView.setUint8(0, 81)

        return buffer
    }
    /**
     * Creates a packet to request a list of custom game lobbies
     * @returns {ArrayBuffer} The formatted show lobbies packet
     */
    NetworkProtocol.prototype.sendShowLobbies = function () {
        var buffer = new ArrayBuffer(2)
        var dataView = new DataView(buffer)

        // Packet type: show lobbies (93)
        dataView.setUint8(0, 93)

        return buffer
    }
    /**
     * Creates a packet to join a custom game lobby
     * @param {number} lobbyId - The ID of the lobby to join
     * @param {string} password - The password for the lobby (if required)
     * @returns {ArrayBuffer} The formatted join lobby packet
     */
    NetworkProtocol.prototype.sendJoinLobby = function (lobbyId, password) {
        var buffer = new ArrayBuffer(5 + (password.length * 2 + 2))
        var dataView = new DataView(buffer)

        // Packet type: join lobby (94)
        dataView.setUint8(0, 94)

        // Lobby ID to join
        dataView.setUint32(1, lobbyId, true)

        // Write the password as UTF-16
        writeUtf16String(5, dataView, password)

        return buffer
    }
    /**
     * Creates a packet to send a captcha response to the server
     * @param {string} captchaResponse - The captcha response token
     * @returns {ArrayBuffer} The formatted captcha packet
     */
    NetworkProtocol.prototype.sendCaptcha = function (captchaResponse) {
        var buffer = new ArrayBuffer(1 + (captchaResponse.length + 1))
        var dataView = new DataView(buffer)

        // Packet type: captcha (100)
        dataView.setUint8(0, 100)

        // Write the captcha response as ASCII
        writeAsciiString(1, dataView, captchaResponse)

        return buffer
    }
    /**
     * Creates a packet to send an authentication token to the server
     * @param {string} authToken - The authentication token
     * @returns {ArrayBuffer} The formatted auth token packet
     */
    NetworkProtocol.prototype.sendAuthToken = function (authToken) {
        var buffer = new ArrayBuffer(1 + (authToken.length + 1))
        var dataView = new DataView(buffer)

        // Packet type: auth token (101)
        dataView.setUint8(0, 101)

        // Write the auth token as ASCII
        writeAsciiString(1, dataView, authToken)

        return buffer
    }
    /**
     * Creates a packet to update custom game settings
     * @param {number} settingType - The type of setting to update
     * @param {number} value - The new value for the setting
     * @param {number} [extraValue] - Additional value for some setting types
     * @returns {ArrayBuffer} The formatted custom game update packet
     */
    NetworkProtocol.prototype.sendCustomGameUpdate = function (settingType, value, extraValue) {
        var buffer = new ArrayBuffer(4)
        var dataView = new DataView(buffer)

        // Packet type: custom game update (91)
        dataView.setUint8(0, 91)

        // Setting type to update
        dataView.setUint8(1, settingType)

        // Handle different setting types with appropriate data formats
        if (settingType == CustomGameUpdateType.STARTMASS || settingType == CustomGameUpdateType.VIRUS_DENSITY) {
            // These settings use 16-bit unsigned integers
            dataView.setUint16(2, value, false)
        } else if (settingType == CustomGameUpdateType.RESPAWN_DELAY) {
            // Respawn delay uses 16-bit signed integer
            dataView.setInt16(2, value, false)
        } else {
            // Default case: 8-bit values
            dataView.setUint8(2, value)
            dataView.setUint8(3, extraValue)
        }

        return buffer
    }
    /**
     * Creates a packet to update custom game settings with a string value
     * @param {number} settingType - The type of string setting to update
     * @param {string} value - The string value for the setting
     * @returns {ArrayBuffer} The formatted custom game update string packet
     */
    NetworkProtocol.prototype.sendCustomGameUpdateString = function (settingType, value) {
        var buffer = new ArrayBuffer(4 + value.length * 2)
        var dataView = new DataView(buffer)

        // Packet type: custom game update string (92)
        dataView.setUint8(0, 92)

        // Setting type to update
        dataView.setUint8(1, settingType)

        // Write the string value as UTF-16
        writeUtf16String(2, dataView, value)

        return buffer
    }
    /**
     * Writes a null-terminated ASCII string to a DataView
     * @param {number} offset - The starting offset in the DataView
     * @param {DataView} dataView - The DataView to write to
     * @param {string} str - The string to write
     * @returns {void}
     */
    function writeAsciiString(offset, dataView, str) {
        for (var i = 0; i < str.length; i++) {
            dataView.setUint8(offset, str.charCodeAt(i))
            offset++
        }
        // Add null terminator
        dataView.setUint8(offset, 0)
    }
    /**
     * Writes a null-terminated UTF-16 string to a DataView
     * @param {number} offset - The starting offset in the DataView
     * @param {DataView} dataView - The DataView to write to
     * @param {string} str - The string to write
     */
    function writeUtf16String(offset, dataView, str) {
        for (var i = 0; i < str.length; i++) {
            dataView.setUint16(offset, str.charCodeAt(i), true)
            offset += 2
        }
        // Add null terminator
        dataView.setUint16(offset, 0, true)
    }
    function _0x12300(_0x11205) {
        var _0x111EE = ""
        while (true) {
            var _0x111D7 = _0x11205.getUint8(_0x11205.offset)
            _0x11205.offset++
            if (_0x111D7 == 0) {
                break
            }
            _0x111EE += String.fromCharCode(_0x111D7)
        }
        return _0x111EE
    }
    function _0x122E9(_0x11205) {
        var _0x111EE = ""
        while (true) {
            var _0x111D7 = _0x11205.getUint16(_0x11205.offset, true)
            _0x11205.offset += 2
            if (_0x111D7 == 0) {
                break
            }
            _0x111EE += String.fromCharCode(_0x111D7)
        }
        return _0x111EE
    }
    function _0x12625(_0x111EE) {
        while (true) {
            var _0x111D7 = _0x111EE.getUint16(_0x111EE.offset, true)
            _0x111EE.offset += 2
            if (_0x111D7 == 0) {
                break
            }
        }
    }
    function _0x11AEA(_0x111D7, _0x111EE) {
        if (_0x111EE) {
            switch (_0x111D7.code) {
                case "auth/user-disabled":
                    alert("This account has been permanently suspended by an administrator.")
                    break
                case "auth/popup-closed-by-user":
                    break
                default:
                    alert(_0x111D7.message + " (" + _0x111D7.code + ")")
                    break
            }
        }
    }
    function _0x1169A(_0x1124A, _0x11233) {
        var _0x11205 = ""
        var _0x1121C = ""
        var _0x111EE = "white"
        if (_0x11233.flags.STAFF) {
            _0x1121C = "Gota.io Staff"
            _0x11205 = "build"
            _0x111EE = "royalblue"
        } else {
            if (_0x11233.flags.VERIFIED) {
                _0x1121C = "Verified Player"
                _0x11205 = "check_circle"
            } else {
                return
            }
        }
        var _0x111D7 = document.createElement("i")
        _0x111D7.className = "material-icons"
        _0x111D7.id = "user-badge"
        _0x111D7.innerText = _0x11205
        _0x111D7.style.color = _0x111EE
        $(_0x111D7).attr("data-balloon", _0x1121C)
        $(_0x111D7).attr("data-balloon-pos", "right")
        $(_0x1124A).append(_0x111D7)
    }
    function _0x1166C(_0x111EE, _0x11205) {
        var _0x111D7 = document.createElement("i")
        _0x111D7.className = "material-icons"
        _0x111D7.innerText = _0x111EE
        _0x111D7.setAttribute("data-balloon", _0x11205)
        _0x111D7.setAttribute("data-balloon-pos", "up")
        return _0x111D7
    }
    function _0x116B1(_0x11302, _0x11330, _0x11278, _0x11205) {
        var _0x1124A = document.createElement("li")
        _0x1124A.className = "user-embed menu-sub-bg2"
        _0x1124A.style.backgroundColor = uiTheme.uiMenuTitleBackgroundColor
        var _0x11233 = document.createElement("img")
        _0x11233.src = _0x11302.avatar
        _0x11233.alt = _0x11302.username
        _0x1124A.appendChild(_0x11233)
        var _0x11261 = document.createElement("div")
        _0x11261.className = "info"
        var _0x11319 = document.createElement("div")
        _0x11319.className = "username"
        _0x11319.innerText = _0x11302.username
        _0x11261.appendChild(_0x11319)
        _0x1169A(_0x11319, _0x11302)
        var _0x112EB = document.createElement("div")
        var _0x1128F = false
        var _0x112D4 = null
        if (_0x11278) {
            _0x112D4 = _0x11302.presence.server.charAt(0).toUpperCase() + _0x11302.presence.server.slice(1)
            if (_0x11302.presence.timestamp + 6e4 < new Date().getTime() || _0x11302.presence.id === undefined) {
                _0x112EB.className = "status offline"
                _0x112EB.innerText = "Not playing on any server"
            } else {
                _0x1128F = true
                _0x112EB.className = "status " + (_0x11302.presence.status === "ONLINE" ? "online" : "spectate")
                _0x112EB.innerText = (_0x11302.presence.status === "ONLINE" ? "Playing " : "Spectating ") + _0x11302.presence.gamemode + " on " + _0x112D4 + " (ID " + _0x11302.presence.id + ")"
            }
        } else {
            _0x112EB.className = "status pending"
            _0x112EB.innerText = "Pending Friend Request"
        }
        _0x11261.appendChild(_0x112EB)
        var _0x111EE = document.createElement("div")
        _0x111EE.className = "actions"
        _0x11319.addEventListener("click", function (_0x111D7) {
            showAccountProfile(_0x11302, $("#main-social"))
        })
        if (_0x11278 && _0x1128F) {
            var _0x112A6 = _0x1166C("input", "Join Server")
            _0x112A6.addEventListener("click", function (_0x111D7) {
                selectServer(_0x112D4)
                player1.play()
                player1.selfMsg(_0x11302.username + "'s ID is " + _0x11302.presence.id)
                hideUIElement($("#main-social"))
            })
            _0x111EE.appendChild(_0x112A6)
        }
        if (!_0x11278) {
            var _0x1121C = _0x1166C("done", "Add as Friend")
            _0x1121C.isHandlingRequest = false
            _0x1121C.addEventListener("click", function (_0x111EE) {
                if (_0x1121C.isHandlingRequest) {
                    return
                }
                _0x1121C.isHandlingRequest = true
                fb_app1
                    .auth()
                    .currentUser.getIdToken()
                    .then((_0x111EE) => {
                        fetch(ACCOUNTS_URL + "/api/v1/social/friends", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                token: _0x111EE,
                                target: _0x11302.uid,
                                action: 2
                            })
                        })
                            .then((_0x111D7) => {
                                return _0x111D7.json()
                            })
                            .then((_0x111D7) => {
                                if (_0x111D7.code !== 200) {
                                    alert(_0x111D7.message)
                                }
                                _0x1121C.isHandlingRequest = false
                            })
                            .catch((_0x111D7) => {
                                alert(_0x111D7)
                                _0x1121C.isHandlingRequest = false
                            })
                    })
                    .catch((_0x111D7) => {
                        _0x11AEA(_0x111D7, true)
                        _0x1121C.isHandlingRequest = false
                    })
            })
            _0x111EE.appendChild(_0x1121C)
        }
        var _0x112BD = _0x1166C("block", "Remove Friend")
        _0x112BD.isHandlingRequest = false
        _0x112BD.addEventListener("click", function (_0x111EE) {
            if (_0x112BD.isHandlingRequest || !confirm('Are you sure you want to remove "' + _0x11302.username + '" as your friend?')) {
                return
            }
            _0x112BD.isHandlingRequest = true
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x111EE) => {
                    fetch(_0x111D7 + "/api/v1/social/friends", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: _0x111EE,
                            target: _0x11302.uid,
                            action: 4
                        })
                    })
                        .then((_0x111D7) => {
                            return _0x111D7.json()
                        })
                        .then((_0x111D7) => {
                            alert(_0x111D7.message)
                            if (_0x111D7.code === 200) {
                                fb_app1.database().ref(socialData.callbacks[_0x11302.uid]).off()
                                socialData.elements[_0x11302.uid].remove()
                                delete socialData.callbacks[_0x11302.uid]
                                delete socialData.elements[_0x11302.uid]
                            }
                            _0x112BD.isHandlingRequest = false
                        })
                        .catch((_0x111D7) => {
                            alert(_0x111D7)
                            _0x112BD.isHandlingRequest = false
                        })
                })
                .catch((_0x111D7) => {
                    _0x11AEA(_0x111D7, true)
                    _0x112BD.isHandlingRequest = false
                })
        })
        _0x111EE.appendChild(_0x112BD)
        _0x1124A.appendChild(_0x11261)
        _0x1124A.appendChild(_0x111EE)
        if (_0x11205) {
            return _0x11330.appendChild(_0x1124A)
        } else {
            return _0x1124A
        }
    }
    function showAccountProfile(_0x11205, _0x111EE, _0x111D7) {
        if (_0x111EE) {
            hideUIElement(_0x111EE)
        }
        $("#profile-username").text(_0x11205.username)
        $("#profile-avatar").attr("src", _0x11205.avatar)
        $("#profile-avatar").attr("alt", _0x11205.username)
        $("#profile-level").html("Level " + _0x11205.levelData.level + "&nbsp;&nbsp;&nbsp;[" + formatExperience(_0x11205.levelData.xp_current) + "/" + formatExperience(_0x11205.levelData.xp_needed) + "]")
        if (_0x11205.title && _0x11205.title > 0 && _0x12739[_0x11205.title]) {
            $("#profile-title").text(_0x12739[_0x11205.title])
        } else {
            $("#profile-title").text("")
        }
        $("#profile-name").off("click")
        if (_0x11205.uid == globalUserData.uid) {
            $("#profile-name").on("click", function () {
                $("#popup-profile").hide()
                showMainUI($("#popup-account-username"))
            })
            $("#profile-name").css("cursor", "pointer")
        } else {
            $("#profile-name").css("cursor", "default")
        }
        if (_0x11205.flags.STAFF) {
            $("#profile-avatar").addClass("spin")
        } else {
            $("#profile-avatar").removeClass("spin")
        }
        _0x1169A($("#profile-username"), _0x11205)
        $("#profile-close-btn").off("click")
        $("#profile-close-btn").on("click", function () {
            if (_0x111EE) {
                showUIElement(_0x111EE)
            }
            hideUIElement($("#popup-profile"))
        })
        showUIElement($("#popup-profile"))
    }
    /**
     * Initialize the friends list for a user
     * @param {Object} userData - The user data object containing uid
     * @param {Object} [app] - Optional Firebase app instance (uses fb_app1 if not provided)
     */
    function checkFriendList(userData, app) {
        if (isFriendsInitialized) {
            return
        }

        // Use the provided app or default to fb_app1
        const firebaseApp = app || fb_app1

        if (!firebaseApp) {
            console.error("Firebase app not available for friend list")
            return
        }

        var friendsList = $("#social-friends .user-list")[0]
        var pendingList = $("#social-friends .user-list")[1]
        $("#social-uid").text(userData.uid)
        firebaseApp
            .database()
            .ref("/friendships/" + userData.uid)
            .on("value", function (snapshot) {
                if (snapshot.val() === null) {
                    var _0x11278 = document.createElement("div")
                    var _0x1128F = document.createElement("span")
                    _0x11278.className = "title-text center"
                    _0x1128F.innerText = "You have no friends 😥"
                    _0x11278.appendChild(_0x1128F)
                    _0x11205.appendChild(_0x11278)
                    return
                }
                var _0x111EE = 0
                var _0x11233 = AuthenticatedResponse.val()
                var _0x1124A = false
                Object.keys(_0x11233).map((_0x11261) => {
                    var _0x11278 = _0x11233[_0x11261]
                    if (!_0x11278 && !_0x1124A) {
                        _0x1124A = true
                        app
                            .auth()
                            .currentUser.getIdToken()
                            .then((_0x111EE) => {
                                fetch(_0x111D7 + "/api/v1/social/friends/pending", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json"
                                    },
                                    body: JSON.stringify({
                                        token: _0x111EE
                                    })
                                })
                                    .then((_0x111D7) => {
                                        return _0x111D7.json()
                                    })
                                    .then((_0x111D7) => {
                                        if (_0x111D7.code === 200) {
                                            _0x111D7.profiles.forEach((_0x111EE) => {
                                                if (!socialData.pendingFriends.includes(_0x111EE)) {
                                                    socialData.pendingFriends.push(_0x111EE.uid)
                                                }
                                                if (socialData.elements[_0x111EE.uid]) {
                                                    var _0x111D7 = _0x116B1(_0x111EE, socialData.elements[_0x111EE.uid], false, false)
                                                    _0x1121C.replaceChild(_0x111D7, socialData.elements[_0x111EE.uid])
                                                    socialData.elements[_0x11261] = _0x111D7
                                                    return
                                                }
                                                socialData.elements[_0x111EE.uid] = _0x116B1(_0x111EE, _0x1121C, false, true)
                                            })
                                        }
                                    })
                            })
                            .catch((_0x111C0) => {
                                return _0x11AEA(_0x111C0, false)
                            })
                        return
                    }
                    if (!socialData.callbacks[_0x11261]) {
                        var _0x1128F = "/users/" + _0x11261
                        socialData.callbacks[_0x11261] = _0x1128F
                        app
                            .database()
                            .ref(_0x1128F)
                            .on("value", function (_0x1121C) {
                                if (_0x1121C.val() === null) {
                                    return
                                }
                                var _0x111EE = _0x1121C.val()
                                socialData.timestamps[_0x111EE.uid] = _0x111EE.presence.timestamp
                                if (socialData.pendingFriends.includes(_0x11261)) {
                                    socialData.pendingFriends.slice(socialData.pendingFriends.indexOf(_0x11261), 1)
                                    socialData.elements[_0x11261].remove()
                                    var _0x111D7 = _0x116B1(_0x111EE, socialData.elements[_0x11261], true, false)
                                    _0x11205.appendChild(_0x111D7)
                                    socialData.elements[_0x11261] = _0x111D7
                                    return
                                }
                                if (socialData.elements[_0x11261]) {
                                    var _0x111D7 = _0x116B1(_0x111EE, socialData.elements[_0x11261], true, false)
                                    _0x11205.replaceChild(_0x111D7, socialData.elements[_0x11261])
                                    socialData.elements[_0x11261] = _0x111D7
                                    return
                                }
                                socialData.elements[_0x11261] = _0x116B1(_0x111EE, _0x11205, true, true)
                                hudElements.friendOnlineCount.text(_0x11A1B() + " online")
                            })
                    }
                    if (_0x11278) {
                        _0x111EE++
                    }
                })
                $("#social-friends-count").text(_0x111EE)
            })
        setInterval(function () {
            for (var _0x111D7 in socialData.timestamps) {
                if (!socialData.timestamps.hasOwnProperty(_0x111D7)) {
                    return
                }
                var _0x1121C = socialData.timestamps[_0x111D7]
                if (_0x1121C + 6e4 < new Date().getTime() || _0x1121C === undefined) {
                    var _0x11205 = socialData.elements[_0x111D7].children[1].children[1]
                    _0x11205.innerText = "Not playing on any server"
                    _0x11205.className = "status offline"
                    var _0x111EE = socialData.elements[_0x111D7].children[2].children[0]
                    if (_0x111EE.dataset.balloon === "Join Server") {
                        _0x111EE.remove()
                    }
                }
            }
        }, 6e4)
        isFriendsInitialized = true
    }
    function _0x11A1B() {
        var _0x11205 = 0
        var _0x111D7 = new Date().getTime()
        for (var _0x111EE in socialData.timestamps) {
            var _0x1121C = socialData.timestamps[_0x111EE]
            if (_0x1121C + 6e4 < _0x111D7 || _0x1121C === undefined) {
            } else {
                _0x11205++
            }
        }
        return _0x11205
    }
    /**
     * Initialize the game UI and set up event handlers
     */
    function initializeGameUI() {
        if (eventSettings.enabled && !clientSettings.cDisableEventSkins) {
            $("body").toggleClass("event-" + eventSettings.key)
        }
        $(".server-tab").on("click", function () {
            var _0x111D7 = $(this).attr("region")
            setActiveServerTab(_0x111D7)
        })
        $("#btn-play").on("click", function () {
            if (selectedServer == null) {
                return
            }
            if (Object.keys(player1.myCells).length != 0 && this.currentServerName == selectedServer.name) {
                hideUIElement(mainUI)
                return
            }
            player1.spectate = false

            player1.enabled = true
            player2.enabled = false
            player1.play()
        })

        profiles.forEach((tbtn) => {
            tbtn.addEventListener("click", function () {
                pages.forEach((section) => {
                    section.style.display = "none"
                    section.classList.remove("active")
                })
                profiles.forEach((btn) => {
                    btn.classList.remove("active")
                })
                const activeTab = document.querySelector(`[data-tab="${this.dataset.tab}"]`)
                const activeSection = document.getElementById(`${this.dataset.tab}`)

                if (activeTab && activeSection) {
                    activeTab.classList.add("active")
                    activeSection.style.display = "block"
                    activeSection.classList.add("active")
                }
                console.log(this.dataset.tab)
            })
        })

        $("#btn-cellpanel").on("click", function () {
            show_side_menu("main-subpanel")
        })
        $("#btn-reddit").on("click", function () {
            window.open("https://www.reddit.com/r/PlayGotaIO/", "_blank")
        })
        $("#btn-discord").on("click", function () {
            window.open("https://gota.io/discord", "_blank")
        })
        $("#name-box").keypress(function (_0x111D7) {
            if (_0x111D7.keyCode == 13 && $(this).is(":focus")) {
                player1.play()
            }
        })
        $("#btn-spec").on("click", function () {
            if (selectedServer == null) {
                return
            }
            if (player1.spectate && this.currentServerName == selectedServer.name) {
                hideUIElement(mainUI)
                return
            }
            player1.spectate = true

            player1.spec()
        })
        chatInput.addEventListener("keyup", function (_0x111D7) {
            var _0x1121C = _0x111D7.target.value
            var _0x11233 = _0x1121C.split(" ")
            // Up arrow key - navigate chat history backwards
            if (_0x111D7.keyCode == 38 && $(this).is(":focus")) {
                if (chatHistoryIndex == -1) {
                    chatHistoryIndex = chatHistory.length - 1
                } else {
                    if (chatHistoryIndex > 1) {
                        chatHistoryIndex--
                    }
                }

                if (chatHistoryIndex <= 0) {
                    chatHistoryIndex = 0
                }

                if (chatHistory.length > 0 && chatHistoryIndex >= 0) {
                    setChatInputValue(chatHistory[chatHistoryIndex])
                }
                return
            } // Down arrow key - navigate chat history forwards
            else if (_0x111D7.keyCode == 40 && $(this).is(":focus")) {
                if (chatHistoryIndex == -1) {
                    chatHistoryIndex = 0
                } else {
                    if (chatHistoryIndex < chatHistory.length - 1) {
                        chatHistoryIndex++
                    }
                }

                if (chatHistoryIndex >= chatHistory.length - 1) {
                    chatHistoryIndex = chatHistory.length - 1
                }

                if (chatHistory.length > 0 && chatHistoryIndex >= 0) {
                    setChatInputValue(chatHistory[chatHistoryIndex])
                }
                return
            }
            if (_0x111D7.keyCode == 13 && $(this).is(":focus")) {
                handleChatMessage($(this).val())
            }
            if (_0x1121C.length == 0 || _0x1121C.endsWith(" ") || _0x111D7.keyCode == 13) {
                $("#autocomplete-panel").html("")
                $("#autocomplete-panel").hide()
            } else {
                if (_0x1121C.startsWith("/")) {
                    if (_0x11233.length > 1) {
                        return
                    }
                    $("#autocomplete-panel").html("<table><thead><tr><th>Command</th><th>Aliases</th><th>Description</th></tr></thead><tbody></tbody></table>")
                    var _0x1124A = -1
                    Object.values(_0x11610).map((_0x111D7) => {
                        if (
                            (_0x1124A = _0x111D7.triggers.findIndex((_0x111D7) => {
                                return _0x111D7.toLowerCase().startsWith(_0x11233[0].substring(1).toLowerCase())
                            })) > -1
                        ) {
                            $("#autocomplete-panel tbody").append("<tr><td>" + _0x111D7.triggers[_0x1124A] + "</td><td>" + _0x111D7.triggers + "</td><td>" + _0x111D7.description + "</td></tr>")
                        }
                    })
                    if ($("#autocomplete-panel tbody").children().length == 0) {
                        $("#autocomplete-panel").hide()
                    } else {
                        $("#autocomplete-panel").show()
                    }
                } else {
                    if (_0x11233[_0x11233.length - 1].startsWith(":")) {
                        $("#autocomplete-panel").html("")
                        var _0x111EE = Object.keys(_0x11838).filter((_0x111D7) => {
                            return _0x111D7.toLowerCase().includes(_0x11233[_0x11233.length - 1].substring(1).toLowerCase())
                        })
                        var _0x11205 = Object.keys(gifEmoteList).filter((_0x111D7) => {
                            return _0x111D7.toLowerCase().includes(_0x11233[_0x11233.length - 1].substring(1).toLowerCase())
                        })
                        if (_0x111EE.length === 0 && _0x11205.length === 0) {
                            $("#autocomplete-panel").html("")
                            $("#autocomplete-panel").hide()
                            return
                        } else {
                            $("#autocomplete-panel").show()
                        }
                        if (_0x111EE.length > 0) {
                            $("#autocomplete-panel").append("<h3>Emotes</h3>")
                            _0x111EE.forEach((_0x111D7) => {
                                $("#autocomplete-panel").append("<img name='" + _0x111D7 + "' title='" + _0x111D7 + "' src='https://gota.io/emotes/" + _0x111D7 + ".png' />")
                            })
                        }
                        if (_0x11205.length > 0) {
                            $("#autocomplete-panel").append("<h3>Gifs</h3>")
                            _0x11205.forEach((_0x111D7) => {
                                $("#autocomplete-panel").append("<img name='" + _0x111D7 + "' title='" + _0x111D7 + "' src='https://gota.io/emotes/gifs/" + _0x111D7 + ".gif' />")
                            })
                        }
                    }
                }
            }
            chatHistoryIndex = -1
            // Reset chat history index
        })
        $("#autocomplete-panel").on("click", function (_0x111D7) {
            var _0x111EE = $("#chat-input").val().split(" ")
            if (_0x111D7.target.nodeName === "TD") {
                setChatInputValue("/" + _0x111D7.target.parentElement.children[0].innerHTML + " ")
                $("#autocomplete-panel").html("")
                $("#autocomplete-panel").hide()
                $("#chat-input").focus()
            } else {
                if (_0x111D7.target.nodeName === "IMG") {
                    setChatInputValue(
                        $("#chat-input")
                            .val()
                            .substring(0, $("#chat-input").val().length - _0x111EE[_0x111EE.length - 1].length)
                        + _0x111D7.target.attributes.name.nodeValue
                        + " "
                    )
                    $("#autocomplete-panel").html("")
                    $("#autocomplete-panel").hide()
                    $("#chat-input").focus()
                }
            }
        })
        $("#animationDelay").on("change", function () {
            var _0x111D7 = parseInt($(this).val())
            if (isNaN(_0x111D7)) {
                _0x111D7 = 90
            }
            clientSettings.rAnimationDelay = Math.min(Math.max(_0x111D7, 1), 250)
            $("#animationDelay").val(clientSettings.rAnimationDelay)
            $("#rAnimationDelay").val(clientSettings.rAnimationDelay)
        })
        $("#camDelay").on("change", function () {
            var _0x111D7 = parseInt($(this).val())
            if (isNaN(_0x111D7)) {
                _0x111D7 = 10
            }
            clientSettings.rCamDelay = Math.min(Math.max(_0x111D7, 10), 200)
            $("#camDelay").val(clientSettings.rCamDelay)
            $("#rCamDelay").val(clientSettings.rCamDelay)
        })
        $("#reconnectPeriod").on("change", function () {
            var _0x111D7 = parseInt($(this).val())
            if (isNaN(_0x111D7)) {
                _0x111D7 = 5
            }
            clientSettings.rReconnectPeriod = Math.min(Math.max(_0x111D7, 0), 10)
            $("#reconnectPeriod").val(clientSettings.rReconnectPeriod)
            $("#rReconnectPeriod").val(clientSettings.rReconnectPeriod)
        })
        $("#viewDistance").on("change", function () {
            var _0x111D7 = parseInt($(this).val())
            if (isNaN(_0x111D7)) {
                _0x111D7 = 100
            }
            clientSettings.rViewDistance = Math.min(Math.max(_0x111D7, 50), 150)
            $("#viewDistance").val(clientSettings.rViewDistance)
            $("#rViewDistance").val(clientSettings.rViewDistance)
            player1.sendOptions()
        })
        $("#uiScale").on("change", function () {
            var _0x111D7 = parseInt($(this).val())
            if (isNaN(_0x111D7)) {
                _0x111D7 = 100
            }
            _0x111D7 *= 0.01
            clientSettings.rUiScale = Math.min(Math.max(_0x111D7, 0.5), 1.25)
            $("#uiScale").val(Number.parseFloat(clientSettings.rUiScale * 100).toFixed(0))
            $("#rUiScale").val(clientSettings.rUiScale)
            $(".ui-scale").css("transform", "scale(" + clientSettings.rUiScale + ")")
        })
        $("#chat-emote-btn").css("background-image", "url(https://gota.io/emotes/" + emotiesNames[Math.floor(Math.random() * emotiesNames.length)] + ".png)")
        $("#chat-emote-btn").on("click", function () {
            $("#emote-panel").toggle()
        })
        $("#emote-panel ul li img").on("click", function (_0x111D7) {
            _0x11233(_0x111D7.target.name + " ")
            $("#chat-input").focus()
        })
            // Chat panel resize functionality
            ; (function () {
                var chatPanel = document.getElementById("chat-panel")
                document.getElementById("chat-resize").addEventListener("mousedown", startChatResize, false)
                var startX, startY, startWidth, startHeight

                /**
                 * Start chat panel resize operation
                 * @param {MouseEvent} event - Mouse down event
                 */
                function startChatResize(event) {
                    startX = event.clientX
                    startY = event.clientY
                    startWidth = parseInt(document.defaultView.getComputedStyle(chatPanel).width, 10)
                    startHeight = parseInt(document.defaultView.getComputedStyle(chatPanel).height, 10)
                    document.documentElement.addEventListener("mousemove", resizeChat, false)
                    document.documentElement.addEventListener("mouseup", stopChatResize, false)
                }

                /**
                 * Resize chat panel during mouse move
                 * @param {MouseEvent} event - Mouse move event
                 */
                function resizeChat(event) {
                    chatPanel.style.width = startWidth + event.clientX - startX + "px"
                    chatPanel.style.height = startHeight - (event.clientY - startY) + "px"
                }

                /**
                 * Stop chat panel resize operation
                 */
                function stopChatResize() {
                    document.documentElement.removeEventListener("mousemove", resizeChat, false)
                    document.documentElement.removeEventListener("mouseup", stopChatResize, false)
                }
            })()

        // --- Bind the generic handlers ---
        $(".checkbox-options")
            .off("change")
            .on("change", function () {
                handleCheckboxChange($(this))
            })
        // Use .off first to prevent duplicate handlers
        $(".options-container select")
            .off("change")
            .on("change", function () {
                handleSelectChange($(this))
            })
        $(".options-container input[type=range]")
            .off("change")
            .on("change", function () {
                updateRangeInput($(this))
            })
        // Use 'change' for when value settles
        $(".dual-settings-content input[type=range]")
            .off("change")
            .on("change", function () {
                updateRangeInput($(this))
            })
        // Use 'change' for when value settles
        $(".input-option")
            .off("change")
            .on("change", function () {
                handleInputChange($(this))
            })
        // Ensure 'change' for text input after blur/enter

        $("#btn-changelog").on("click", function () {
            hideUIElement($("#popup-changelog"))
            showUIElement(mainUI)
            window.open(DISCORD_CHANNEL_URL, "_blank")
        })
        $("#btn-close-changelog").on("click", function () {
            hideUIElement($("#popup-changelog"))
            showUIElement(mainUI)
        })

        $("#btn-accept").on("click", function () {
            player1.sendPacket(new network.sendInviteResponse(true))
            player2.sendPacket(new network.sendInviteResponse(true))
            hideUIElement($("#popup-party"))
        })
        $("#btn-decline").on("click", function () {
            player1.sendPacket(new network.sendInviteResponse(false))
            player2.sendPacket(new network.sendInviteResponse(false))
            hideUIElement($("#popup-party"))
        })
        $("#popup-party-code-content button").on("click", function () {
            const codeInput = $("#popup-party-code-content input")
            // Use modern Clipboard API with fallback to deprecated execCommand
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard
                    .writeText(codeInput.val())
                    .then(() => {
                        $("#popup-party-code").hide()
                    })
                    .catch((err) => {
                        console.error("Failed to copy text: ", err)
                        // Fallback to old method
                        codeInput.select()
                        document.execCommand("Copy")
                        $("#popup-party-code").hide()
                    })
            } else {
                // Fallback for browsers that don't support clipboard API
                codeInput.select()
                document.execCommand("Copy")
                $("#popup-party-code").hide()
            }
        })
        $("#menu-invite").on("click", function () {
            var _0x111D7 = contextMenu.data("selected")
            if (player1.enabled) player1.sendPacket(new network.sendPartyAction(0, _0x111D7))
            else if (player2.enabled) player2.sendPacket(new network.sendPartyAction(0, _0x111D7))
        })
        $("#menu-whisper").on("click", function () {
            var _0x111D7 = contextMenu.data("selected")
            var _0x111EE = $("#chat-input").val()
            $("#chat-input").val("/t " + _0x111D7 + " " + _0x111EE)
        })
        $("#menu-profile").on("click", function () {
            var _0x111D7 = contextMenu.data("selected")
            player1.sendPacket(new network.sendShowProfile(_0x111D7))
        })
        $("#menu-pu_pr").on("click", function () {
            if (player1.partyCode == undefined) {
                player1.sendPacket(new network.sendPartyAction(4, 0))
                $("#menu-pu_pr span").text("Private")
            } else {
                player1.sendPacket(new network.sendPartyAction(4, 1))
                $("#menu-pu_pr span").text("Public")
            }
        })
        $("#menu-promote").on("click", function () {
            var _0x111D7 = contextMenu.data("party") + 1
            if (player1.isPartyLeader()) {
                if (_0x111D7 >= 0) {
                    player1.sendPacket(new network.sendPartyAction(2, _0x111D7))
                } else if (player2.isPartyLeader() && _0x111D7 >= 0) {
                    player2.sendPacket(new network.sendPartyAction(2, _0x111D7))
                }
            }
        })
        $("#menu-kick").on("click", function () {
            var _0x111D7 = contextMenu.data("party") + 1

            if (_0x111D7 >= 0) {
                if (player1.isPartyLeader()) {
                    player1.sendPacket(new network.sendPartyAction(1, _0x111D7))
                } else if (player2.isPartyLeader()) {
                    player2.sendPacket(new network.sendPartyAction(1, _0x111D7))
                }
            }
        })
        $("#menu-spectate").on("click", function () {
            var _0x111D7 = contextMenu.data("selected")
            if (_0x111D7 >= 0) {
                player1.sendPacket(new network.sendSpectate(_0x111D7))
            }
        })
        $("#menu-block").on("click", function () {
            var _0x111EE = parseInt(contextMenu.data("selected"))
            var _0x111D7 = _0x112D4(_0x111EE)
            player1.selfMsg(_0x111D7)
        })
        $('#menu-mark-enemy').on('click', function () {
            var _0x111EE = contextMenu.data('cellId');
            console.log(_0x111EE);
            console.log('network code here');
            var member = player1.bucket.get(_0x111EE) || player2.bucket.get(_0x111EE);
            if (member) {
                console.log(member);
                onScreenIcons.push({
                    icon: 'flag',
                    text: 'Enemy',
                    x: member.x,
                    y: member.y,
                    party: !!player1.party[_0x111EE],
                    color: '#ff5555',
                    opacity: 1,
                    lasttime: Date.now() * 0.001
                });
            } else {
                console.log('player left the screen');
            }
        });
        $("#btn-leave-party").on("click", function () {
            if (player1.enabled && player1.party.length) {
                player1.sendPacket(new network.sendPartyAction(3, 0))
            } else {
                if (player2.enabled && player2.party.length) {
                    player2.sendPacket(new network.sendPartyAction(3, 0))
                }
            }
        })
        $(document).on("click", function (_0x111D7) {
            contextMenu.hide()
            if (_0x111D7.target.id !== "chat-emote-btn") {
                $("#emote-panel").hide()
            }
            if ($("#popup-party-code").css("display") !== "none" && _0x111D7.target.id !== "popup-party-code") {
                $("#popup-party-code").hide()
            }
        })
        $("#aEditChatTabs").on("click", function (_0x111D7) {
            _0x1135E()
            hideUIElement(mainUI)
            showUIElement($("#popup-chat-tab-editor"))
        })
        $("#cte-tab-selector").on("change", _0x114FC)
        $("#btn-chat-tab-editor-add").on("click", _0x114CE)
        $("#btn-chat-tab-editor-remove").on("click", _0x114E5)
        $("#btn-chat-tab-editor-update").on("click", _0x1152A)
        $(".custom-asset-skinner").on("click", function () {
            $("#popup-asset-skinner .title-text").text($(this).text())
            $("#input-asset-skinner").attr("asset", $(this).attr("id")).val("")
            hideUIElement(mainUI)
            showUIElement($("#popup-asset-skinner"))
        })
        $("#btn-custom-asset-set").on("click", function () {
            if (!clientSettings.cThemeEnabled) {
                enableCustomTheme()
            }
            var _0x111EE = $("#input-asset-skinner").val()
            if (_0x111EE) {
                var _0x111D7 = $("#input-asset-skinner").attr("asset")
                if (_0x111D7.charAt(0) == "a" && uiTheme[_0x111D7] != null) {
                    setCustomAsset(_0x111D7, _0x111EE)
                }
            }
            $("#popup-asset-skinner .back-button").trigger("click")
        })
        $("#btn-custom-asset-clear").on("click", function () {
            if (!clientSettings.cThemeEnabled) {
                enableCustomTheme()
            }
            var _0x111D7 = $("#input-asset-skinner").attr("asset")
            if (_0x111D7.charAt(0) == "a" && uiTheme[_0x111D7] != null) {
                setCustomAsset(_0x111D7, "")
            }
        })
        $("#popup-asset-skinner")
            .on("dragover", false)
            .on("drop", function (_0x111D7) {
                if (!clientSettings.cThemeEnabled) {
                    enableCustomTheme()
                }
                var _0x11205 = $("#input-asset-skinner").attr("asset")
                if (_0x11205.charAt(0) == "a" && uiTheme[_0x11205] != null) {
                    var _0x111EE = _0x119ED(_0x111D7.originalEvent)
                    if (/\.(jpe?g|png|gif)$/i.test(_0x111EE.name)) {
                        var _0x1121C = new FileReader()
                        _0x1121C.addEventListener(
                            "load",
                            function () {
                                setCustomAsset(_0x11205, this.result)
                            },
                            false
                        )
                        _0x1121C.readAsDataURL(_0x111EE)
                    }
                }
                return false
            })

        function setCustomAsset(assetType, assetUrl) {
            // Log for debugging
            console.log("setCustomAsset called with:", assetType, assetUrl)
            console.log("uiTheme[assetType]:", uiTheme[assetType])

            // Update the theme setting
            uiTheme[assetType] = assetUrl

            // Apply the asset change
            if (typeof settingHandlers[assetType] === "function") {
                settingHandlers[assetType](assetUrl)
            } else {
                console.warn("No handler found for asset type:", assetType)
            }

            // Save the updated theme
            saveUserSettings()

            // Show confirmation message to user
            const assetTypeNames = {
                aCustomBackground: "Background image",
                aCustomSpike: "Virus skin",
                aCustomMother: "Mother cell skin"
            }

            const message = assetUrl && assetUrl.length > 0 ? `${assetTypeNames[assetType]} has been set.` : `${assetTypeNames[assetType]} has been cleared.`

            player1.selfMsg(message)
        }

        $("#btn-food-colors").on("click", function () {
            updateFoodColorList()
            // Update the food color list before showing the popup
            hideUIElement(mainUI)
            showUIElement($("#popup-food-colors"))
        })
        $("#cGlobalLeaderboard").on("change", function () {
            console.log(globalLBShown)
            if (!globalUserData || globalLBShown) {
                return
            }
            globalLBShown = true
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x111EE) => {
                    fetch(ACCOUNTS_URL + "/api/v1/options/setFlags", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: _0x111EE
                        })
                    })
                        .then((_0x111D7) => {
                            try {
                                return _0x111D7.json()
                            } catch (e) {
                                // If JSON parsing fails, return a default object
                                return {
                                    success: _0x111D7.ok,
                                    message: _0x111D7.ok
                                }
                            }
                        })
                        .then((_0x111D7) => {
                            console.log(_0x111D7.message)
                            globalLBShown = false
                            //$(this).prop("checked", _0x111D7.message);
                        })
                        .catch((_0x111D7) => {
                            globalLBShown = false
                            alert(_0x111D7)
                        })
                })
                .catch((_0x111C0) => {
                    console.error("Authentication error:", _0x111C0)
                    globalLBShown = false
                })
        })
        $("#cGlobalLeaderboard2").on("change", function () {
            if (!globalUser2Data || globalLBShown2) {
                return
            }
            globalLBShown2 = true
            fb_app2
                .auth()
                .currentUser.getIdToken()
                .then((_0x111EE) => {
                    fetch(ACCOUNTS_URL + "/api/v1/options/setFlags", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: _0x111EE
                        })
                    })
                        .then((_0x111D7) => {
                            try {
                                return _0x111D7.json()
                            } catch (e) {
                                // If JSON parsing fails, return a default object
                                return {
                                    success: _0x111D7.ok,
                                    message: _0x111D7.ok
                                }
                            }
                        })
                        .then((_0x111D7) => {
                            globalLBShown2 = false
                            //$(this).prop("checked", _0x111D7.message);
                        })
                        .catch((_0x111D7) => {
                            globalLBShown2 = false
                            alert(_0x111D7)
                        })
                })
                .catch((_0x111C0) => {
                    console.error("Authentication error:", _0x111C0)
                    globalLBShown2 = false
                })
        })
        fb_app1.auth().onAuthStateChanged(function (_0x111D7) {
            if (_0x111D7) {
                if (!_0x1163E.consented) {
                    fb_app1
                        .auth()
                        .signOut()
                        .then(function () { })
                    return
                }
                showAccountLoading()
                if (player1.isConnected() && fb_app1.auth().currentUser !== null) {
                    fb_app1
                        .auth()
                        .currentUser.getIdToken(true)
                        .then((_0x111D7) => {
                            player1.sendPacket(new network.sendAuthToken(_0x111D7))
                        })
                        .catch((_0x111C0) => {
                            return _0x11AEA(_0x111C0, true)
                        })
                }
                var userRef = fb_app1.database().ref("users/" + _0x111D7.uid)
                var initialized = false
                userRef.on("value", function (snapshot) {
                    var userData = snapshot.val()
                    if (!userData) {
                        return
                    }
                    if (!initialized) {
                        $("#account-loader").hide()
                        $("#authed").show()
                        $("#authed").attr("style", "display: flex;")
                        $("#cGlobalLeaderboard").removeAttr("disabled")
                        $("#cGlobalLeaderboard").prop("checked", userData.flags.PUBLIC)
                        initialized = true
                    }
                    globalUserData = userData
                    $("#account-avatar").attr("src", userData.avatar)
                    $("#account-username").text(userData.username)
                    if (userData.flags.STAFF) {
                        chatContainer.style.userSelect = "text"
                    }
                    _0x1169A($("#account-username"), userData)
                    $("#account-level").html("Level " + userData.levelData.level)

                    $("#account-xp").html(formatExperience(userData.levelData.xp_current) + "/" + formatExperience(userData.levelData.xp_needed) + " XP")

                    $(".xp-meter > .progress").each(function () {
                        var _0x111D7 = (userData.levelData.xp_current / userData.levelData.xp_needed) * 100
                        $(this).animate(
                            {
                                width: _0x111D7 + "%"
                            },
                            1200
                        )
                    })
                    if (!player1.accountListeners.loadServers) {
                        player1.accountListeners.loadServers = fb_app1
                            .database()
                            .ref("servers/account/" + globalUserData.uid)
                            .on("value", function (_0x11233) {
                                var _0x111D7 = _0x11233.val()
                                if (!_0x111D7) {
                                    return
                                }
                                _0x11205 = {}
                                for (var _0x111EE in _0x111D7) {
                                    var _0x1121C = _0x111D7[_0x111EE]
                                    if (_0x1121C.up) {
                                        _0x11205[_0x1121C.name] = new ServerInfo(_0x1121C.name, _0x1121C.ip + ":" + _0x1121C.port, 0, 0, "?", _0x1121C.gamemode, _0x1121C.region, _0x1121C.ssl, 0)
                                    }
                                }
                                updateServerListUI()
                                if (selectedServer != null) {
                                    selectServer(selectedServer.name)
                                }
                            })
                    }
                    if (userData.flags.DISCORD_LINKED && !player1.accountListeners.loadDiscord) {
                        player1.accountListeners.loadDiscord = fb_app1
                            .firestore()
                            .collection("discord")
                            .doc(globalUserData.uid)
                            .onSnapshot((_0x111D7) => {
                                if (_0x111D7.exists) {
                                    $("#discordLinkStatus").text("Your account is linked with " + _0x111D7.data().username + "#" + _0x111D7.data().discrim)
                                    $("#discordLinkStatus").show()
                                    $("#discordLink").hide()
                                    $("#discordUnlink").show()
                                    $(".discord-login-container").css("padding", "15px")
                                } else {
                                    $("#discordLinkStatus").hide()
                                    $("#discordUnlink").hide()
                                    $("#discordLink").show()
                                    $(".discord-login-container").css("padding", "30px")
                                }
                            })
                    }
                    if (userData.tokens !== undefined) {
                        var _0x11261 = new Date()
                        _0x11261.setMonth(_0x11261.getMonth() + userData.tokens)
                        if (userData.tokens == 0) {
                            $("#redeem-tokens").hide()
                            $("#token-amount").text("You have 0 tokens.")
                        } else {
                            $("#redeem-tokens").show()
                            $("#token-amount").text("You have " + userData.tokens + " tokens, maximum expiry date: " + _0x11261.toString())
                            $("#redeem-spend").attr("max", userData.tokens)
                        }
                    } else {
                        $("#token-amount").text("You have 0 tokens.")
                    }
                    if (globalUserData.title && globalUserData.title > 0 && _0x12808 && _0x12808.titles && _0x12808.titles.length > 0) {
                        var _0x111EE = $("#account-titles")
                        var _0x11278 = 0
                        for (var _0x1124A = 0; _0x1124A < _0x12808.titles.length; _0x1124A++) {
                            if (_0x12808.titles[_0x1124A] == globalUserData.title) {
                                _0x11278 = _0x1124A + 1
                            }
                        }
                        if (_0x11278 > 0) {
                            _0x111EE.val(_0x11278)
                        }
                    }
                    if (!player1.accountListeners.loadPrivateData) {
                        player1.accountListeners.loadPrivateData = fb_app1
                            .database()
                            .ref("private/" + _0x111D7.uid)
                            .on("value", function (_0x11233) {
                                var _0x111EE = _0x11233.val()
                                if (!_0x111EE) {
                                    return
                                }
                                _0x12808 = _0x111EE
                                if (_0x12808.titles && _0x12808.titles.length > 0) {
                                    var _0x111D7 = $("#account-titles")
                                    var _0x1121C = 0
                                    _0x111D7.empty()
                                    _0x111D7.append("<option value='0'>Default Title</option>")
                                    for (var _0x11205 = 0; _0x11205 < _0x111EE.titles.length; _0x11205++) {
                                        _0x111D7.append("<option value='" + (_0x11205 + 1) + "'>" + _0x12739[_0x12808.titles[_0x11205]] + "</option>")
                                        if (_0x12808.titles[_0x11205] == globalUserData.title) {
                                            _0x1121C = _0x11205 + 1
                                        }
                                    }
                                    if (_0x1121C > 0) {
                                        _0x111D7.val(_0x1121C)
                                    }
                                    _0x111D7.css("display", "inline-block")
                                } else {
                                    $("#account-titles").css("display", "none")
                                }
                                if (_0x12808.message && _0x12808.message.title && _0x12808.message.content && !_0x12808.message.read) {
                                    $("#popup-message-title").text(_0x12808.message.title)
                                    $("#popup-message-content").html(_0x12808.message.content)
                                    showUIElement($("#popup-message"))
                                    hideUIElement(mainUI)
                                }
                            })
                    }
                    if (isFriendsInitialized) {
                        checkFriendList(globalUserData, fb_app1)
                    }
                    _0x11D6E(_0x111D7.uid)
                })
            } else {
                $("#cGlobalLeaderboard").attr("disabled")
                if (!_0x1163E.consented) {
                    $("#authed").hide()
                    $("#account-loader").hide()
                    $("#guest").hide()
                    $("#no_cookie_consent").show()
                } else {
                    showGuestUI()
                }
            }
        })
        $("#account-login").on("click", function () {
            if (_0x1163E.consented) {
                fb_app1
                    .auth()
                    .signInWithPopup(googleAuthProvider)
                    .then(function (_0x111C0) { })
                    .catch((_0x111C0) => {
                        return _0x11AEA(_0x111C0, true)
                    })
            }
        })
        $("#account-logout").on("click", function () {
            fb_app1
                .auth()
                .signOut()
                .then(function () {
                    $("#authed").hide(500)
                    showGuestUI()
                    $("#discordLinkStatus").hide()
                    $(".discord-login-container").show()
                })
                .catch((_0x111C0) => {
                    return _0x11AEA(_0x111C0, true)
                })
        })
        $("#account-shop").on("click", function () {
            window.open("https://store.gota.io/", "_blank")
        })
        $("#account-social").on("click", function () {
            if (!globalUserData) {
                return
            }
            checkFriendList(globalUserData, fb_app1)
            showUIElement($("#main-social"))
            hideUIElement($(mainUI))
        })
        $("#account2-social").on("click", function () {
            if (!globalUserData) {
                return
            }
            checkFriendList(globalUserData, fb_app2)
            showUIElement($("#main-social"))
            hideUIElement($(mainUI))
        })
        $("#social-back-button").on("click", function () {
            hideUIElement($("#main-social"))
            showUIElement($(mainUI))
        })
        $("#account-avatar").on("click", function () {
            showAccountProfile(globalUserData, mainUI)
        })
        $("#food-colors-close-btn").on("click", function () {
            showMainUI(mainUI)
            hideUIElement($("#popup-food-colors"))
        })
        function _0x1121C(_0x111EE, _0x111D7) {
            if (_0x111EE) {
                $(_0x111D7).prop("disabled", false)
                $(_0x111D7).text("Set")
                return
            }
            $(_0x111D7).prop("disabled", true)
            $(_0x111D7).text("...")
        }
        $("#account-titles").on("change", function () {
            if (globalLBShown) {
                return
            }
            var _0x111EE = parseInt($(this).val())
            globalLBShown = true
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x11205) => {
                    fetch(_0x111D7 + "/api/v1/options/setTitle", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: _0x11205,
                            title: _0x111EE
                        })
                    })
                        .then((_0x111D7) => {
                            return _0x111D7.json()
                        })
                        .then((_0x111C0) => {
                            globalLBShown = false
                        })
                        .catch((_0x111D7) => {
                            globalLBShown = false
                        })
                })
                .catch((_0x111C0) => {
                    _0x11AEA(_0x111C0, true)
                    globalLBShown = false
                })
        })

        fb_app2.auth().onAuthStateChanged(function (_0x111D7) {
            if (_0x111D7) {
                if (!_0x1163E.consented) {
                    fb_app2
                        .auth()
                        .signOut()
                        .then(function () { })
                    return
                }
                showAccount2Loading()
                if (player2.isConnected() && fb_app2.auth().currentUser !== null) {
                    fb_app2
                        .auth()
                        .currentUser.getIdToken(true)
                        .then((_0x111D7) => {
                            player2.sendPacket(new network.sendAuthToken(_0x111D7))
                        })
                        .catch((_0x111C0) => {
                            return _0x11AEA(_0x111C0, true)
                        })
                }
                var _0x111EE = fb_app2.database().ref("users/" + _0x111D7.uid)
                var _0x1121C = false
                _0x111EE.on("value", function (_0x1128F) {
                    var _0x11233 = _0x1128F.val()
                    if (!_0x11233) {
                        return
                    }
                    if (!_0x1121C) {
                        $("#account2-loader").hide()
                        $("#authed2").show()
                        $("#authed2").attr("style", "display: flex;")
                        $("#cGlobalLeaderboard2").removeAttr("disabled")
                        $("#cGlobalLeaderboard2").prop("checked", _0x11233.flags.PUBLIC)
                        _0x1121C = true
                    }
                    globalUser2Data = _0x11233
                    $("#account2-avatar").attr("src", _0x11233.avatar)
                    $("#account2-username").text(_0x11233.username)
                    if (_0x11233.flags.STAFF) {
                        chatContainer.style.userSelect = "text"
                    }
                    _0x1169A($("#account2-username"), _0x11233)
                    $("#account2-level").html("Level " + _0x11233.levelData.level + "&nbsp;&nbsp;&nbsp;&nbsp;" + formatExperience(_0x11233.levelData.xp_current) + "/" + formatExperience(_0x11233.levelData.xp_needed) + " XP")
                    $(".xp-meter > .progress").each(function () {
                        var _0x111D7 = (_0x11233.levelData.xp_current / _0x11233.levelData.xp_needed) * 100
                        $(this).animate(
                            {
                                width: _0x111D7 + "%"
                            },
                            1200
                        )
                    })
                    /*if (!player2.accountListeners.loadServers) {
                          player2.accountListeners.loadServers = fb_app2.database().ref("servers/account/" + _0x1281F.uid).on("value", function (_0x11233) {
                              var _0x111D7 = _0x11233.val();
                              if (!_0x111D7) {
                                  return;
                              }
                              ;
                              _0x11205 = {};
                              for (var _0x111EE in _0x111D7) {
                                  var _0x1121C = _0x111D7[_0x111EE];
                                  if (_0x1121C.up) {
                                      _0x11205[_0x1121C.name] = new _0x124CC(_0x1121C.name, _0x1121C.ip + ":" + _0x1121C.port, 0, 0, "?", _0x1121C.gamemode, _0x1121C.region, _0x1121C.ssl, 0);
                                  }
                              }
                              ;
                              updateServerListUI();
                              if (selectedServer != null) {
                                  selectServer(selectedServer.name);
                              }
                          });
                      }*/
                    if (_0x11233.flags.DISCORD_LINKED && !player2.accountListeners.loadDiscord) {
                        player2.accountListeners.loadDiscord = fb_app2
                            .firestore()
                            .collection("discord")
                            .doc(globalUser2Data.uid)
                            .onSnapshot((_0x111D7) => {
                                if (_0x111D7.exists) {
                                    $("#discordLinkStatus").text("Your account is linked with " + _0x111D7.data().username + "#" + _0x111D7.data().discrim)
                                    $("#discordLinkStatus").show()
                                    $("#discordLink").hide()
                                    $("#discordUnlink").show()
                                    $(".discord-login-container").css("padding", "15px")
                                } else {
                                    $("#discordLinkStatus").hide()
                                    $("#discordUnlink").hide()
                                    $("#discordLink").show()
                                    $(".discord-login-container").css("padding", "30px")
                                }
                            })
                    }
                    /*if (_0x11233.tokens !== undefined) {
                          var _0x11261 = new Date;
                          _0x11261.setMonth(_0x11261.getMonth() + _0x11233.tokens);
                          if (_0x11233.tokens == 0) {
                              $("#redeem-tokens").hide();
                              $("#token-amount").text("You have 0 tokens.");
                          } else {
                              $("#redeem-tokens").show();
                              $("#token-amount").text("You have " + _0x11233.tokens + " tokens, maximum expiry date: " + _0x11261.toString());
                              $("#redeem-spend").attr("max", _0x11233.tokens);
                          }
                      } else {
                          $("#token-amount").text("You have 0 tokens.");
                      }*/
                    if (globalUser2Data.title && globalUser2Data.title > 0 && _0x12808 && _0x12808.titles && _0x12808.titles.length > 0) {
                        var _0x111EE = $("#account2-titles")
                        var _0x11278 = 0
                        for (var _0x1124A = 0; _0x1124A < _0x12808.titles.length; _0x1124A++) {
                            if (_0x12808.titles[_0x1124A] == globalUser2Data.title) {
                                _0x11278 = _0x1124A + 1
                            }
                        }
                        if (_0x11278 > 0) {
                            _0x111EE.val(_0x11278)
                        }
                    }
                    if (!player2.accountListeners.loadPrivateData) {
                        player2.accountListeners.loadPrivateData = fb_app2
                            .database()
                            .ref("private/" + _0x111D7.uid)
                            .on("value", function (_0x11233) {
                                var _0x111EE = _0x11233.val()
                                if (!_0x111EE) {
                                    return
                                }
                                _0x12808 = _0x111EE
                                if (_0x12808.titles && _0x12808.titles.length > 0) {
                                    var _0x111D7 = $("#account2-titles")
                                    var _0x1121C = 0
                                    _0x111D7.empty()
                                    _0x111D7.append("<option value='0'>Default Title</option>")
                                    for (var _0x11205 = 0; _0x11205 < _0x111EE.titles.length; _0x11205++) {
                                        _0x111D7.append("<option value='" + (_0x11205 + 1) + "'>" + _0x12739[_0x12808.titles[_0x11205]] + "</option>")
                                        if (_0x12808.titles[_0x11205] == globalUser2Data.title) {
                                            _0x1121C = _0x11205 + 1
                                        }
                                    }
                                    if (_0x1121C > 0) {
                                        _0x111D7.val(_0x1121C)
                                    }
                                    _0x111D7.css("display", "inline-block")
                                } else {
                                    $("#account2-titles").css("display", "none")
                                }
                                if (_0x12808.message && _0x12808.message.title && _0x12808.message.content && !_0x12808.message.read) {
                                    $("#popup-message-title").text(_0x12808.message.title)
                                    $("#popup-message-content").html(_0x12808.message.content)
                                    showUIElement($("#popup-message"))
                                    hideUIElement(mainUI)
                                }
                            })
                    }
                    if (isFriendsInitialized) {
                        checkFriendList(globalUserData, fb_app2)
                    }
                    _0x11D6E(_0x111D7.uid)
                })
            } else {
                $("#cGlobalLeaderboard2").attr("disabled")
                if (!_0x1163E.consented) {
                    $("#authed2").hide()
                    $("#account2-loader").hide()
                    $("#guest2").hide()
                    $("#no_cookie_consent2").show()
                } else {
                    showGuest2UI()
                }
            }
        })
        $("#account2-login").on("click", function () {
            if (_0x1163E.consented) {
                fb_app2
                    .auth()
                    .signInWithPopup(googleAuthProvider)
                    .then(function (_0x111C0) { })
                    .catch((_0x111C0) => {
                        return _0x11AEA(_0x111C0, true)
                    })
            }
        })
        $("#account2-logout").on("click", function () {
            fb_app2
                .auth()
                .signOut()
                .then(function () {
                    $("#authed2").hide(500)
                    showGuest2UI()
                    $("#discordLinkStatus").hide()
                    $(".discord-login-container").show()
                })
                .catch((_0x111C0) => {
                    return _0x11AEA(_0x111C0, true)
                })
        })
        /*$("#account2-shop").on("click", function () {
              window.open("https://store.gota.io/", "_blank");
          });
          $("#account-social").on("click", function () {
              if (!_0x1281F) {
                  return;
              }
              ;
              _0x11E26(_0x1281F);
              showUIElement($("#main-social"));
              hideUIElement($(mainUI));
          });
          $("#social-back-button").on("click", function () {
              hideUIElement($("#main-social"));
              showUIElement($(mainUI));
          });*/
        $("#account2-profile").on("click", function () {
            showAccountProfile(globalUser2Data, mainUI)
        })
        /*$("#food-colors-close-btn").on("click", function () {
              _0x12750(mainUI);
              hideUIElement($("#popup-food-colors"));
          });
          function _0x1121C(_0x111EE, _0x111D7) {
              if (_0x111EE) {
                  $(_0x111D7).prop("disabled", false);
                  $(_0x111D7).text("Set");
                  return;
              }
              ;
              $(_0x111D7).prop("disabled", true);
              $(_0x111D7).text("...");
          }*/

        $("#popup-message-read-btn").on("click", function () {
            if (globalLBShown) {
                return
            }
            hideUIElement($("#popup-message"))
            showMainUI(mainUI)
            globalLBShown = true
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x111EE) => {
                    fetch(_0x111D7 + "/api/v1/options/markAsRead", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: _0x111EE
                        })
                    })
                        .then((_0x111D7) => {
                            return _0x111D7.json()
                        })
                        .then((_0x111C0) => {
                            globalLBShown = false
                        })
                        .catch((_0x111D7) => {
                            globalLBShown = false
                        })
                })
                .catch((_0x111C0) => {
                    _0x11AEA(_0x111C0, true)
                    globalLBShown = false
                })
        })
        $("#account-set-username-btn").on("click", function () {
            if (!globalUserData) {
                return
            }
            _0x1121C(false, this)
            var _0x111EE = $("#account-username-input").val()
            if (!_0x111EE || _0x111EE == "" || _0x111EE.trim() == "") {
                alert("Please provide a username!")
                _0x1121C(true, this)
                return
            }
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x11205) => {
                    fetch(_0x111D7 + "/api/v1/social/username", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: _0x11205,
                            username: _0x111EE
                        })
                    })
                        .then((_0x111D7) => {
                            return _0x111D7.json()
                        })
                        .then((_0x111D7) => {
                            _0x1121C(true, this)
                            if (_0x111D7.code == 200) {
                                showMainUI(mainUI)
                                $("#popup-account-username").hide()
                                return
                            }
                            alert(_0x111D7.message)
                        })
                        .catch((_0x111D7) => {
                            alert(_0x111D7)
                            _0x1121C(true, this)
                        })
                })
                .catch((_0x111C0) => {
                    _0x1121C(true, this)
                    _0x11AEA(_0x111C0, true)
                })
        })
        $(".popup-panel .back-button").on("click", function () {
            _0x11B74()
            showMainUI(mainUI)
        })
        $("#discordLink").on("click", function () {
            if (!globalUserData) {
                return
            }
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x111D7) => {
                    window.open("https://accounts.gota.io/api/v1/options/discord/redirect?token=" + _0x111D7, "popup", "width=600,height=700")
                })
        })
        $("#discordUnlink").on("click", function () {
            if (!globalUserData) {
                return
            }
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x111EE) => {
                    fetch(_0x111D7 + "/api/v1/options/discord/unlink", {
                        method: "POST",
                        body: JSON.stringify({
                            token: _0x111EE
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                        .then((_0x111D7) => {
                            return _0x111D7.json()
                        })
                        .then((_0x111D7) => {
                            alert(_0x111D7.message)
                        })
                })
                .catch((_0x111C0) => {
                    return _0x11AEA(_0x111C0)
                })
        })
        $("#redeem-tokens").submit(function (_0x111EE) {
            _0x111EE.preventDefault()
            if (!globalUserData) {
                return
            }
            if (!confirm("By redeeming, you are agreeing the locked name rules linked below the form.\n\nABUSE WILL RESULT IN THE DELETION OF YOUR LOCKED NAME WITH NO REFUND AND THE POSSIBILITY OF ACCOUNT SUSPENSION.\n\nPress OK to redeem.")) {
                return
            }
            var _0x11205 = $("#redeem-name").val()
            var _0x1121C = $("#redeem-spend").val()
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x111EE) => {
                    fetch(_0x111D7 + "/api/v1/options/redeem", {
                        method: "POST",
                        body: JSON.stringify({
                            token: _0x111EE,
                            name: _0x11205,
                            spend: parseInt(_0x1121C)
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                        .then((_0x111D7) => {
                            return _0x111D7.json()
                        })
                        .then((_0x111D7) => {
                            alert(_0x111D7.message)
                            if (_0x111D7.code === 200) {
                                _0x11D6E(globalUserData.uid)
                            }
                        })
                })
                .catch((_0x111C0) => {
                    return _0x11AEA(_0x111C0)
                })
        })
        $(".error-banner").on("click", function () {
            $(this).hide()
        })
        $("#btn-add-friend").on("click", function (_0x111EE) {
            _0x111EE.preventDefault()
            if (!globalUserData) {
                return
            }
            var _0x1121C = prompt("Enter friend's UID (found above add friend button)")
            if (!_0x1121C) {
                return
            }
            var _0x11205 = _0x1121C.replace(/\s/g, "")
            if (typeof _0x1121C !== "string" || _0x11205.length === 0) {
                return alert("Please enter a valid UID")
            }
            fb_app1
                .auth()
                .currentUser.getIdToken()
                .then((_0x111EE) => {
                    fetch(_0x111D7 + "/api/v1/social/friends", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            token: _0x111EE,
                            target: _0x11205,
                            action: 1
                        })
                    })
                        .then((_0x111D7) => {
                            return _0x111D7.json()
                        })
                        .then((_0x111D7) => {
                            alert(_0x111D7.message)
                        })
                })
                .catch((_0x111C0) => {
                    return _0x11AEA(_0x111C0, true)
                })
        })
        document.getElementById("party-canvas").oncontextmenu = handlePartyContextMenuClick
        $(document).keyup(function (_0x111D7) {
            if (_0x111D7.keyCode == 13) {
                var _0x111EE = $("#chat-input")
                if (document.activeElement.tagName != "INPUT") {
                    var _0x11205 = _0x111EE[0]
                    if (_0x11205) {
                        _0x11205.setSelectionRange(_0x11205.value.length, _0x11205.value.length)
                    }
                    _0x111EE.focus()
                } else {
                    if (_0x111EE.is(":focus")) {
                        _0x111EE.blur()
                    }
                }
            }
        })
        $(window).bind("beforeunload", function () {
            return "Are you sure you want to leave Gota.io?"
        })
        showCoordAdjust()

        setupDualKeybindsSection()

        $(document).on("click", ".keybinds-btn", function () {
            $(".keybinds-btn").removeClass("keybinds-btn-selected")
            $(this).addClass("keybinds-btn-selected")
            isKeybindEditMode = true
        })
        $("#btn-reset-keybinds").on("click", function () {
            $(".keybinds-btn").each(function () {
                var _0x111D7 = $(this)
                var _0x111EE = _0x111D7.attr("id")
                if (defaultKeyMappings[_0x111EE] != null) {
                    // _0x11769 likely holds defaults
                    keyMappings[_0x111EE] = defaultKeyMappings[_0x111EE]
                    // Reset runtime object
                    updateKeybindText(_0x111D7)
                    // Update button text
                }
            })

            saveKeybindsToStorage()
            // Save the reset state immediately
            loadKeybindsCache()
            // Update the cache
        })
        $("#scrimmage-mode-select").on("change", function () {
            $("#scrimmage-mode-info").children().css("display", "none")
            $("#scrimmage-info-" + $(this).val()).css("display", "block")
        })
        $("#btn-queue").on("click", function () {
            var _0x111D7 = parseInt($("#scrimmage-mode-select").val())
            var _0x111EE = isNaN(_0x111D7) ? 0 : Math.min(Math.max(_0x111D7, 0), 100)
            player1.sendPacket(new network.sendQueue(_0x111EE))
            $(this).blur()
        })
        $("#btn-leave-match").on("click", function () {
            player1.sendPacket(new network.sendLeaveMatch())
        })
        $("#btn-custom-create").on("click", function () {
            player1.sendPacket(new network.sendCustomGame(0))
            $(this).blur()
        })
        $("#btn-custom-return").on("click", function () {
            player1.sendPacket(new network.sendCustomGame(1))
        })
        $("#btn-custom-start").on("click", function () {
            player1.sendPacket(new network.sendCustomGame(2))
        })
        $("#btn-custom-lobbies").on("click", function () {
            player1.sendPacket(new network.sendShowLobbies())
        })
        $("#btn-lobbies-refresh").on("click", function () {
            player1.sendPacket(new network.sendShowLobbies())
        })
        $("#btn-lobbies-join").on("click", function () {
            if (_0x12459 === 0) {
                return
            }
            var _0x111EE = _0x12459
            var _0x11205 = ""
            var _0x111D7 = _0x1173B[_0x111EE]
            if (_0x111D7 == null) {
                return
            }
            if (_0x111D7.hasPasscode) {
                _0x11205 = prompt("Enter the password to join this game", "")
            }
            if (_0x11205 == null) {
                _0x11205 = ""
            }
            player1.sendPacket(new network.sendJoinLobby(_0x111EE, _0x11205))
        })
        $("#btn-lobbies-return").on("click", function () {
            $(".scrimmage-full").css("display", "none")
            $("#scrimmage-menu").css("display", "block")
        })
        $("#scrimmage-map").on("change", function (_0x111EE) {
            var _0x11205 = $(this).find("option:selected").val()
            var _0x111D7 = $(this).attr("data")
            if (_0x11205 != _0x111D7) {
                $("#scrimmage-map option[value='" + _0x111D7 + "']").prop("selected", true)
                player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.MAP, _0x11205))
            }
        })
        $("#scrimmage-mapmode").on("change", function (_0x111EE) {
            var _0x11205 = $(this).find("option:selected").val()
            var _0x111D7 = $(this).attr("data")
            if (_0x11205 != _0x111D7) {
                $("#scrimmage-mapmode option[value='" + _0x111D7 + "']").prop("selected", true)
                player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.MODE, _0x11205))
            }
        })
        $("#scrimmage-mapsize").on("change", function (_0x111EE) {
            var _0x11205 = $(this).find("option:selected").val()
            var _0x111D7 = $(this).attr("data")
            if (_0x11205 != _0x111D7) {
                $("#scrimmage-mapsize option[value='" + _0x111D7 + "']").prop("selected", true)
                player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.SIZE, _0x11205))
            }
        })
        $("#scrimmage-startmass").on("change", function (_0x111EE) {
            var _0x11205 = $(this).val()
            var _0x111D7 = $(this).attr("data")
            if (isNaN(_0x11205)) {
                $(this).val(_0x111D7)
                return
            }
            _0x11205 = Math.max(1, Math.min(parseInt(_0x11205), 32e3))
            if (_0x11205 != _0x111D7) {
                $(this).val(_0x111D7)
                player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.STARTMASS, _0x11205))
            }
        })
        $("#scrimmage-virusDensity").on("change", function (_0x111EE) {
            var _0x11205 = $(this).val()
            var _0x111D7 = $(this).attr("data")
            if (isNaN(_0x11205)) {
                $(this).val(_0x111D7)
                return
            }
            _0x11205 = Math.max(0, Math.min(parseInt(_0x11205), 1e3))
            if (_0x11205 != _0x111D7) {
                $(this).val(_0x111D7)
                player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.VIRUS_DENSITY, _0x11205))
            }
        })
        $("#scrimmage-respawnDelay").on("change", function (_0x111EE) {
            var _0x11205 = $(this).val()
            var _0x111D7 = $(this).attr("data")
            if (isNaN(_0x11205)) {
                $(this).val(_0x111D7)
                return
            }
            _0x11205 = Math.max(-1, Math.min(parseInt(_0x11205), 600))
            if (_0x11205 != _0x111D7) {
                $(this).val(_0x111D7)
                player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.RESPAWN_DELAY, _0x11205))
            }
        })
        $("#scrimmage-lockteams").on("change", function (_0x111D7) {
            var _0x111EE = $(this).prop("checked")
            $(this).prop("checked", !_0x111EE)
            player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.LOCK, _0x111EE == true ? 1 : 0))
        })
        $("#scrimmage-autoSplit").on("change", function (_0x111D7) {
            var _0x111EE = $(this).prop("checked")
            $(this).prop("checked", !_0x111EE)
            player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.AUTOSPLIT, _0x111EE == true ? 1 : 0))
        })
        $("#scrimmage-public").on("change", function (_0x111D7) {
            var _0x111EE = $(this).prop("checked")
            $(this).prop("checked", !_0x111EE)
            player1.sendPacket(new network.sendCustomGameUpdate(CustomGameUpdateType.PUBLIC, _0x111EE == true ? 1 : 0))
        })
        $("#scrimmage-password").on("change", function (_0x111D7) {
            var _0x11205 = $(this).prop("checked")
            $(this).prop("checked", !_0x11205)
            var _0x111EE = ""
            if (_0x11205) {
                _0x111EE = prompt("Enter a password to join your game (32 max characters)", "")
            }
            if (_0x111EE == null) {
                _0x111EE = ""
            }
            player1.sendPacket(new network.sendCustomGameUpdateString(CustomGameUpdateType.PASSWORD, _0x111EE))
        })
        $("#scrimmage-name").on("click", function (_0x111D7) {
            if (!player1.isPartyLeader()) {
                return
            }
            var _0x111EE = prompt("Enter a new name for your game (32 max characters)", $(this).text())
            if (_0x111EE != null) {
                player1.sendPacket(new network.sendCustomGameUpdateString(CustomGameUpdateType.NAME, _0x111EE))
            }
        })
    }
    /**
     * Hide the main menu before starting the game
     */
    function hideMainMenu() {
        if (window.grecaptcha === undefined) {
            return
        }

        captchaAPI = window.grecaptcha
        window.grecaptcha = undefined
        captchaAPI.ready(function () { })
    }
    /**
     * Execute reCAPTCHA verification and start the game
     */
    function _0x118C2() {
        if (!captchaAPI) {
            console.warn("reCAPTCHA API not available")
            // Continue without captcha verification
            if (!player1.spectate) {
                player1.play()
            } else {
                player1.spec()
            }
            return
        }

        captchaAPI
            .execute("6LcycFwUAAAAANrun52k-J1_eNnF9zeLvgfJZSY3", {
                action: "login"
            })
            .then(function (_0x111D7) {
                player1.sendPacket(new network.sendCaptcha(_0x111D7))
                document.body.classList.add("hide-captcha-badge")
                if (!player1.spectate) {
                    player1.play()
                } else {
                    player1.spec()
                }
            })
            .catch(function (error) {
                console.error("reCAPTCHA execution failed:", error)
                // Continue without captcha verification
                if (!player1.spectate) {
                    player1.play()
                } else {
                    player1.spec()
                }
            })
    }
    /**
     * Initialize color pickers for UI theme settings
     */
    function initializeColorPickers() {
        // Initialize color pickers for all UI theme settings
        iterateUserSettings(function (settingId) {
            $("#" + settingId).spectrum({
                color: uiTheme[settingId],
                preferredFormat: "hex",
                showInput: true,
                showAlpha: true,
                clickoutFiresChange: false,
                change: function (color) {
                    uiTheme[settingId] = color.toRgbString()
                    updateUIColor(settingId, uiTheme[settingId])
                }
            })
        })

        // Disable alpha channel for game background and border colors
        $("#uiGameBackgroundColor").spectrum("option", "showAlpha", false)
        $("#uiGameBorderColor").spectrum("option", "showAlpha", false)

        // Initialize Partner Highlight color picker
        $("#uiPartnerHighlightColor").spectrum({
            color: uiTheme.uiPartnerHighlightColor,
            // Use the value from uiTheme
            preferredFormat: "hex",
            showInput: true,
            showAlpha: true,
            // Allow alpha for potential glow-like effects later? Or keep false for solid. Let's start with true.
            clickoutFiresChange: false,
            change: function (color) {
                // Enable theme if not already enabled when changing theme colors
                if (!clientSettings.cThemeEnabled) {
                    enableCustomTheme()
                }
                uiTheme.uiPartnerHighlightColor = color.toRgbString()
                // Store as rgba/rgb string
                // No immediate UI update needed here, it's applied in the game loop
                saveUserSettings()
                // Save settings when color changes
            }
        })

        // Initialize player1 cell color picker
        $("#player1CellColor").spectrum({
            color: uiTheme.player1CellColor || "#ff0000",
            // Default to red
            preferredFormat: "hex",
            showInput: true,
            showAlpha: false,
            clickoutFiresChange: false,
            change: function (color) {
                // Enable theme if not already enabled
                if (!clientSettings.cThemeEnabled) {
                    enableCustomTheme()
                }

                uiTheme.player1CellColor = color.toHexString()
                // Update player1 cells to use the new color
                if (player1 && player1.bucket) {
                    for (var cellId in player1.bucket) {
                        var cell = player1.bucket[cellId]
                        if (cell && cell.type == 2 && cell.playerId === player1.playerId) {
                            cell.needsPixiUpdate = true
                        }
                    }
                }
            }
        })

        // Initialize player2 cell color picker
        $("#player2CellColor").spectrum({
            color: uiTheme.player2CellColor || "#0000ff",
            // Default to blue
            preferredFormat: "hex",
            showInput: true,
            showAlpha: false,
            clickoutFiresChange: false,
            change: function (color) {
                // Enable theme if not already enabled
                if (!clientSettings.cThemeEnabled) {
                    enableCustomTheme()
                }

                uiTheme.player2CellColor = color.toHexString()
                // Update player2 cells to use the new color
                if (player2 && player2.bucket) {
                    for (var cellId in player2.bucket) {
                        var cell = player2.bucket[cellId]
                        if (cell && cell.type == 2 && cell.playerId === player2.playerId) {
                            cell.needsPixiUpdate = true
                        }
                    }
                }
            }
        })

        // Initialize food color picker
        $("#pFoodColors").spectrum({
            preferredFormat: "hex",
            showInput: true,
            chooseText: "Add",
            flat: true,
            clickoutFiresChange: false,
            change: function (color) {
                // Enable theme if not already enabled
                if (!clientSettings.cThemeEnabled) {
                    enableCustomTheme()
                }

                var hexColor = color.toHexString()
                if (!uiTheme._FoodColors.includes(hexColor)) {
                    uiTheme._FoodColors.push(hexColor)
                    updateFoodColorList()
                }
            }
        })
    }
    /**
     * Update the food color list in the UI
     */
    function updateFoodColorList() {
        var colorListElement = $("#food-color-list")
        colorListElement.empty()

        if (uiTheme._FoodColors.length == 0) {
            updateFoodColors()
            return
        }

        try {
            // Add each color to the list
            for (var index in uiTheme._FoodColors) {
                var colorValue = uiTheme._FoodColors[index]
                colorListElement.append("<div c='" + colorValue + "' style='background:" + colorValue + ";color:" + getContrastColor(colorValue) + ";'><span>" + colorValue + "</span><div><button class='btn-food-color'>X</button></div></div>")
            }

            // Add click handler for remove buttons
            $(".btn-food-color").on("click", function () {
                var colorToRemove = $(this).parents().eq(1).attr("c")
                var colorIndex, colorRemoved

                // Remove all instances of this color
                while ((colorIndex = uiTheme._FoodColors.indexOf(colorToRemove)) !== -1) {
                    uiTheme._FoodColors.splice(colorIndex, 1)
                    colorRemoved = true
                }

                if (colorRemoved) {
                    updateFoodColorList()
                }
            })
        } catch (e) {
            uiTheme._FoodColors = []
            colorListElement.empty()
        }

        updateFoodColors()
    }
    /**
     * Update food colors and mark food objects for update
     */
    function updateFoodColors() {
        uiTheme._FoodColors = []
        for (var color of uiTheme._FoodColors) {
            uiTheme._FoodColors.push(PIXI.utils.string2hex(color))
        }

        // Mark all food objects for update
        for (var foodId in player1.foodObjects) {
            player1.foodObjects[foodId].needsPixiUpdate = true
        }
    }
    function _0x112A6(_0x11205) {
        var _0x111EE = $(".keybinds-btn-selected")
        isKeybindEditMode = false
        // Turn off assignment mode
        if (_0x111EE.size() == 0) {
            return
        }
        var _0x111D7 = _0x111EE.first()
        _0x111EE.removeClass("keybinds-btn-selected")
        let assignedValue = -1
        if (_0x11205 != 27) {
            // If not escape key
            assignedValue = _0x11205
        } else {
            assignedValue = -1
            // Treat escape as unbind
        }
        const keybindId = _0x111D7.attr("id")
        keyMappings[keybindId] = assignedValue
        // Update the runtime object
        updateKeybindText(_0x111D7)
        // Update button text

        saveKeybindsToStorage()
        // Save immediately
        loadKeybindsCache()
        // Update the cache
    }
    function updateKeybindText(btnElement) {
        var keyCode = keyMappings[btnElement.attr("id")]
        btnElement.html(getKeyText(keyCode))
    }
    function getKeyText(keyCode) {
        return keyCode > 0 ? keyNames[keyCode].toUpperCase() : "&nbsp;"
    }

    function _0x11D9C() { }
    function initializeEmoteLists() {
        updateTextures()
        _0x11838 = {}
        gifEmoteList = {}
        for (var emote in emotiesNames) {
            var emoteName = emotiesNames[emote]
            $(".emote-list").append("<li><img name='" + emoteName + "' title='" + emoteName + "' src='https://gota.io/emotes/" + emoteName + ".png' /></li>")
            _0x11838[emoteName] = true
        }
        for (var emote in _0x11A8E) {
            var emoteName = _0x11A8E[emote]
            $(".gif-list").append("<li><img name='" + emoteName + "' title='" + emoteName + "' src='https://gota.io/emotes/gifs/" + emoteName + ".gif' /></li>")
            gifEmoteList[emoteName] = true
        }
        for (var emote = 0; emote < ejectMassSkins.length; emote++) {
            var _0x11233 = ejectMassSkins[emote]
            $("#spEffect").append('<option value="' + (emote + 1) + '">' + _0x11FAD(_0x11233) + "</option>")
            array[emote] = tempY
            // Medium circle texture (32px)
            var _0x1121C = new Image()
            _0x1121C.src = "images/ejected_mass_skins/" + _0x11233 + ".png"
            _0x1121C.index = emote
            _0x1121C.addEventListener("load", function () {
                array[this.index] = PIXI.Texture.from(this)
            })
        }
        if (eventSettings.enabled && eventSettings.customEjectedMass) {
            _0x118AB = new Image()
            _0x118AB.src = "images/events/" + eventSettings.key + "/ejected_mass.png"
        }
        _0x11DCA()
        for (var i = 0; i < heartEmojis.length; i++) {
            var index = i
            gifFrames({
                url: "images/effects/" + heartEmojis[index] + ".gif",
                frames: "all",
                cumulative: false,
                outputType: "canvas"
            }).then(function (frameData) {
                var gifTexture = new GifTexture()
                gifTexture.loadFromFrameData(frameData)
                animatedTextures[index] = gifTexture
            })
        }
    }
    function updateTextures() {
        var _0x111D7, _0x11233
        if (!clientSettings.cDisableEventSkins && eventSettings.enabled) {
            _0x111D7 = "images/events/" + eventSettings.key
            _0x11233 = "/spike_mother_happy.png"
        } else {
            _0x111D7 = "images"
            _0x11233 = "/spike_mother.png"
        }
        var _0x111EE = new Image()
        _0x111EE.addEventListener("load", function () {
            spikeTexture = PIXI.Texture.from(_0x111EE)
            if (player1) {
                for (var _0x111D7 in player1.bucket) {
                    var _0x11205 = player1.bucket[_0x111D7]
                    if (_0x11205.type == 3) {
                        _0x11205.needsPixiUpdate = true
                    }
                }
            }
        })
        var _0x11205 = new Image()
        _0x11205.addEventListener("load", function () {
            motherCellTexture = PIXI.Texture.from(_0x11205)
            if (player1) {
                for (var _0x111D7 in player1.bucket) {
                    var _0x111EE = player1.bucket[_0x111D7]
                    if (_0x111EE.type == 4) {
                        _0x111EE.needsPixiUpdate = true
                    }
                }
            }
        })
        var _0x1121C = new Image()
        _0x1121C.addEventListener("load", function () {
            happyMotherCellTexture = PIXI.Texture.from(_0x1121C)
            if (player1) {
                for (var _0x111D7 in player1.bucket) {
                    var _0x111EE = player1.bucket[_0x111D7]
                    if (_0x111EE.type == 4) {
                        _0x111EE.needsPixiUpdate = true
                    }
                }
            }
        })
        _0x111EE.src = _0x111D7 + "/spike.png"
        _0x11205.src = _0x111D7 + "/spike_mother.png"
        _0x1121C.src = _0x111D7 + _0x11233
    }
    /**
     * Handlers for different settings that need special processing
     */
    const settingHandlers = {
        cDisableAA: function () {
            if (app) {
                $("#performance-refresh").css("display", "table-row")
            }
        },
        sRenderType: function () {
            if (app) {
                $("#performance-refresh").css("display", "table-row")
            }
        },
        cHideId: function () {
            var _0x111D7 = clientSettings.cHideId ? "none" : "block"
            document.getElementById("pId").style.display = _0x111D7
        },
        cHideServer: function () {
            var _0x111D7 = clientSettings.cHideServer ? "none" : "block"
            document.getElementById("pServer").style.display = _0x111D7
        },
        cTransCells: function () {
            // Instead of setting alpha on the entire cellContainer, we need to
            // iterate through all cells and set alpha only on the cell background sprites
            // This preserves the visibility of skins, names, and other elements

            // First, update all existing cells in player1's bucket
            for (const cell of player1.bucket.values()) {
                if (cell.type === 2) {
const newAlphaP1Cell = clientSettings.cTransCells ? (cell.originalAlpha * 0.5) : cell.originalAlpha; // Tentative fix calculation for logging
                    console.log(`DEBUG cTransCells P1 Cell: cellId=${cell.id}, type=${cell.type}, cTrans=${clientSettings.cTransCells}, origAlpha=${cell.originalAlpha}, newAlpha=${newAlphaP1Cell}`);
                    cell.alpha = clientSettings.cTransCells ? cell.originalAlpha * 0.5 : cell.originalAlpha; 
                } else if (cell.sprite) {
const newAlphaP1Sprite = clientSettings.cTransCells ? (cell.originalAlpha * 0.5) : cell.originalAlpha; // Tentative fix calculation for logging
                    console.log(`DEBUG cTransCells P1 Sprite: cellId=${cell.id}, type=${cell.type}, cTrans=${clientSettings.cTransCells}, origAlpha=${cell.originalAlpha}, newAlpha=${newAlphaP1Sprite}`);
                    cell.alpha = clientSettings.cTransCells ? cell.originalAlpha * 0.5 : cell.originalAlpha; 
                }
            }

            // Then update all existing cells in player2's bucket
// Then update all existing cells in player2's bucket
            for (const cell of player2.bucket.values()) {
                if (cell.type === 2) {
                    const newAlphaP2Cell = clientSettings.cTransCells ? (cell.originalAlpha * 0.5) : cell.originalAlpha; // Tentative fix calculation for logging
                    console.log(`DEBUG cTransCells P2 Cell: cellId=${cell.id}, type=${cell.type}, cTrans=${clientSettings.cTransCells}, origAlpha=${cell.originalAlpha}, newAlpha=${newAlphaP2Cell}`);
                    cell.alpha = newAlphaP2Cell; 
                } else if (cell.sprite) {
                    cell.alpha = clientSettings.cTransCells ? (cell.originalAlpha * 0.5) : cell.originalAlpha; // Apply relative transparency
                }
            }
            for (const cell of player2.bucket.values()) {
                if (cell.type === 2 && cell.sprite) {
                    cell.sprite.alpha = clientSettings.cTransCells ? cell.originalAlpha * 0.5 : cell.originalAlpha; //
                } else if (cell.sprite) {
                    cell.sprite.alpha = clientSettings.cTransCells ? cell.originalAlpha * 0.5 : cell.originalAlpha; //
                }
            }
        },
        cColoredCellCount: function () {
            player1.updateCellCounter(hudElements.playerCellCount, true)
        },
        cHideChat: function () {
            var _0x111D7 = clientSettings.cHideChat ? "none" : "block"
            $("#chat-panel").css("display", _0x111D7)
        },
        cHideMinimap: function () {
            var _0x111D7 = clientSettings.cHideMinimap ? "none" : "block"
            $("#minimap-panel").css("display", _0x111D7)
        },
        cShowThreatIndicators: function () {
            // No need to do anything here, the setting is checked in updateMinimap
        },
        cCellRing: function () {
            // No need to do anything here, the setting is checked in draw
        },
        cCursorLine: function () {
            // No need to do anything here, the setting is checked in Handle
        },
        sCosmetic: function () {

        },
        sScorePanel: function () {
            switch (clientSettings.sScorePanel) {
                case "0":
                    scorePanel.style.display = "none"
                    scorePanel2.style.display = "none"
                    break
                case "1":
                    scorePanel.style.display = "flex"
                    scorePanel2.style.display = "flex"
                    scorePanelContainer.style.flexDirection = "column"
                    break
                case "2":
                    scorePanel.style.display = "inline-block"
                    scorePanel2.style.display = "inline-block"
                    scorePanelContainer.style.flexDirection = "row"
                    break
            }
        },
        cHideLeaderboard: function () {
            var _0x111D7 = clientSettings.cHideLeaderboard ? "none" : "block"
            $("#leaderboard-panel").css("display", _0x111D7)
        },
        cHideExtraPanel: function () {
            var _0x111D7 = clientSettings.cHideExtraPanel ? "none" : "block"
            $("#extra-panel").css("display", _0x111D7)
        },
        cShowCoordinates: function () {
            var _0x111D7 = clientSettings.cShowCoordinates ? "block" : "none"
            $("#minimap-coordinates").css("display", _0x111D7)
            showCoordAdjust()
        },
        cDisableAutoZoom: function () {
            if (clientSettings.cDisableAutoZoom) {
                //  player1.scale_base = 0.2 * Math.max(canvas.height / 1080, canvas.width / 1920);
            }
        },
        cThemeEnabled: function () {
            if (!clientSettings.cThemeEnabled) {
                resetUIThemeToDefaults()
                iterateUserSettings(function (_0x111D7) {
                    $("#" + _0x111D7).spectrum("disable")
                })
            } else {
                iterateUserSettings(function (_0x111D7) {
                    $("#" + _0x111D7).spectrum("enable")
                })
            }
        },
        cShowBorder: function () {
            drawGameBorder()
        },
        cDisableEventSkins: function () {
            if (eventSettings.enabled) {
                $("body").toggleClass("event-" + eventSettings.key)
            }
            updateTextures()
            _0x11D9C()
        },
        cResizableChat: function () {
            $("#chat-resize").css("display", clientSettings.cResizableChat ? "block" : "none")
        },
        sLinesplitMode: function (newModeValue) {
            // Needs to be added to UI and clientSettings defaults
            if (lineSplitHelper && typeof lineSplitHelper.handleSettingsUpdate === "function") {
                lineSplitHelper.handleSettingsUpdate(newModeValue)
            }
        },
        sShowMass: function () {
            clientOptions.levelMass = CellVisibility[clientSettings.sShowMass]
        },
        sShowNames: function () {
            clientOptions.levelNames = CellVisibility[clientSettings.sShowNames]
        },
        sShowSkins: function () {
            clientOptions.levelSkins = CellVisibility[clientSettings.sShowSkins]
        },
        sMassType: function () {
            clientOptions.massType = MassDisplayType[clientSettings.sMassType]
            globalSizeCache = new Map()
        },
        sTextOutlines: function () {
            clientOptions.textOutlineSize = NameOutlineThickness[clientSettings.sTextOutlines]
            for (var _0x111D7 in player1.playerRegistry.bucket) {
                var _0x111EE = player1.playerRegistry.bucket[_0x111D7]
                if (_0x111EE.nameCache) {
                    _0x111EE.nameCache.style.strokeThickness = clientOptions.textOutlineSize
                }
                player1.playerRegistry.updatePlayer(_0x111EE)
            }
            sizeCache.buildSizeCache()
        },
        sQuality: function () {
            var _0x111D7 = clientOptions.resolution
            clientOptions.resolution = _0x11ABC[clientSettings.sQuality]
            if (_0x111D7 !== clientOptions.resolution) {
                $(window).trigger("resize")
            }
        },
        uiForegroundColor: function (color) {
            if (player1) {
                player1.drawParty()
            }
        },
        uiBackgroundColor: function (_0x111D7) { },
        uiBorderColor: function (_0x111D7) { },
        uiMenuBackgroundColor: function (_0x111D7) { },
        uiMenuTitleBackgroundColor: function (_0x111D7) { },
        uiMenuSubBackgroundColor: function (_0x111D7) { },
        uiMenuSubBackground2Color: function (_0x111D7) { },
        uiPartyLeaderColor: function (_0x111D7) {
            if (player1) {
                player1.drawParty()
            }
        },
        uiGameColorSuccess: function (_0x111D7) { },
        uiGameBackgroundColor: function (color) {
            document.body.style.background = color
        },
        uiGameBorderColor: function () {
            drawGameBorder()
        },
        rUiScale: function (_0x111D7) {
            clientSettings.rUiScale = Math.min(Math.max(_0x111D7, 0.5), 1.25)
            $("#uiScale").val(Number.parseFloat(clientSettings.rUiScale * 100).toFixed(0))
            $(".ui-scale").css("transform", "scale(" + clientSettings.rUiScale + ")")
        },
        rReconnectPeriod: function (_0x111D7) {
            clientSettings.rReconnectPeriod = Math.min(Math.max(_0x111D7, 0), 10)
            $("#reconnectPeriod").val(clientSettings.rReconnectPeriod)
        },
        rAnimationDelay: function (_0x111D7) {
            console.log("A", _0x111D7)
            clientSettings.rAnimationDelay = Math.min(Math.max(_0x111D7, 1), 250)
            $("#animationDelay").val(clientSettings.rAnimationDelay)
        },
        rCamDelay: function (_0x111D7) {
            console.log(_0x111D7)
            clientSettings.rCamDelay = Math.min(Math.max(_0x111D7, 10), 200)
            $("#camDelay").val(clientSettings.rCamDelay)
        },
        rViewDistance: function (_0x111D7) {
            clientSettings.rViewDistance = Math.min(Math.max(_0x111D7, 50), 150)
            $("#viewDistance").val(clientSettings.rViewDistance)
            player1.sendOptions()
        },
        rBorderSize: function (_0x111D7) {
            uiTheme.rBorderSize = Math.min(Math.max(_0x111D7, 1), 256)
            $("#borderSize").text(uiTheme.rBorderSize)
            drawGameBorder()
        },
        rBackgroundOpacity: function (_0x111D7) {
            uiTheme.rBackgroundOpacity = Math.min(Math.max(_0x111D7, 0), 1)
            $("#backgroundOpacity").text(Number.parseFloat(uiTheme.rBackgroundOpacity * 100).toFixed(0))
            document.getElementById("canvas-background").style.opacity = uiTheme.rBackgroundOpacity
        },
        sBackgroundScalingMode: function (mode) {
            // Update the background scaling mode and refresh the background
            uiTheme.sBackgroundScalingMode = mode
            // If there's a background sprite, update its size
            if (backgroundSprite) {
                updateBackgroundSize()
            }
        },
        aCustomBackground: function (_0x111D7) {
            // Clear existing background sprite if it exists
            if (customAssets.aCustomBackground) {
                customAssets.aCustomBackground.destroy()
                customAssets.aCustomBackground = null
            }

            // Remove the CSS background
            document.getElementById("canvas-background").style.backgroundImage = ""

            // If URL is empty, just return (clear the background)
            if (_0x111D7.length === 0) {
                return
            }

            // Use the global CORS proxies list

            // Function to load image with or without proxy
            function loadBackgroundImage(url, useProxy = false, proxyIndex = 0) {
                // Create a new background image
                var bgImage = new Image()
                bgImage.crossOrigin = "anonymous"

                // Determine the URL to use
                let imageUrl = url
                if (useProxy && proxyIndex < corsProxies.length) {
                    imageUrl = corsProxies[proxyIndex] + encodeURIComponent(url)
                    console.log(`Trying with CORS proxy ${proxyIndex + 1}/${corsProxies.length}: ${corsProxies[proxyIndex]}`)
                }

                bgImage.addEventListener("load", function () {
                    // Create a PIXI texture from the loaded image
                    var bgTexture = PIXI.Texture.from(bgImage)

                    // Create a sprite that covers the entire game area
                    if (!backgroundSprite) {
                        backgroundSprite = new PIXI.Sprite(bgTexture)
                        // Add it to the game container at the bottom layer
                        gameContainer.addChildAt(backgroundSprite, 0)
                    } else {
                        backgroundSprite.texture = bgTexture
                    }

                    // Store the texture for later cleanup
                    customAssets.aCustomBackground = bgTexture

                    // Set the sprite to cover the entire game area
                    updateBackgroundSize()

                    // Notify user of success
                    player1.selfMsg("Background image loaded successfully!")
                })

                bgImage.addEventListener("error", function (e) {
                    console.error("Error loading background image:", e)

                    if (!useProxy) {
                        // First failure, try with proxy
                        player1.selfMsg("Unable to load custom background image directly. Trying with CORS proxy...")
                        loadBackgroundImage(url, true, 0)
                    } else if (proxyIndex < corsProxies.length - 1) {
                        // Try next proxy
                        loadBackgroundImage(url, true, proxyIndex + 1)
                    } else {
                        // All proxies failed
                        player1.selfMsg("Failed to load background image. Please try a different image URL.")
                    }
                })

                // Set the source to start loading
                bgImage.src = imageUrl
            }

            // Start loading the image
            loadBackgroundImage(_0x111D7)
        },
        aCustomSpike: function (_0x1121C) {
            if (customAssets.aCustomSpike) {
                customAssets.aCustomSpike.destroy()
            }

            customAssets.aCustomSpike = null

            // Update all existing spike cells
            for (var _0x111EE in player1.bucket) {
                var _0x11205 = player1.bucket[_0x111EE]
                if (_0x11205.type == 3) {
                    _0x11205.needsPixiUpdate = true
                }
            }

            if (_0x1121C.length == 0) {
                return
            }

            // Function to load image with or without proxy
            function loadSpikeImage(url, useProxy = false, proxyIndex = 0) {
                // Create a new image
                var _0x111D7 = new Image()
                _0x111D7.crossOrigin = "anonymous"

                // Determine the URL to use
                let imageUrl = url
                if (useProxy && proxyIndex < corsProxies.length) {
                    imageUrl = corsProxies[proxyIndex] + encodeURIComponent(url)
                    console.log(`Trying spike with CORS proxy ${proxyIndex + 1}/${corsProxies.length}: ${corsProxies[proxyIndex]}`)
                }

                _0x111D7.addEventListener("load", function () {
                    customAssets.aCustomSpike = PIXI.Texture.from(_0x111D7)

                    // Update all spike cells to use the new texture
                    for (var _0x111EE in player1.bucket) {
                        var _0x11205 = player1.bucket[_0x111EE]
                        if (_0x11205.type == 3) {
                            _0x11205.needsPixiUpdate = true
                        }
                    }

                    // Notify user of success
                    player1.selfMsg("Virus skin loaded successfully!")
                })

                _0x111D7.addEventListener("error", function (e) {
                    console.error("Error loading virus skin:", e)

                    if (!useProxy) {
                        // First failure, try with proxy
                        player1.selfMsg("Unable to load custom virus skin directly. Trying with CORS proxy...")
                        loadSpikeImage(url, true, 0)
                    } else if (proxyIndex < corsProxies.length - 1) {
                        // Try next proxy
                        loadSpikeImage(url, true, proxyIndex + 1)
                    } else {
                        // All proxies failed
                        player1.selfMsg("Failed to load virus skin. Please try a different image URL.")
                    }
                })

                // Set the source to start loading
                _0x111D7.src = imageUrl
            }

            // Start loading the image
            loadSpikeImage(_0x1121C)
        },
        aCustomMother: function (_0x1121C) {
            if (customAssets.aCustomMother) {
                customAssets.aCustomMother.destroy()
            }

            customAssets.aCustomMother = null

            // Update all existing mother cells
            for (var _0x111EE in player1.bucket) {
                var _0x11205 = player1.bucket[_0x111EE]
                if (_0x11205.type == 4) {
                    _0x11205.needsPixiUpdate = true
                }
            }

            if (_0x1121C.length == 0) {
                return
            }

            // Function to load image with or without proxy
            function loadMotherImage(url, useProxy = false, proxyIndex = 0) {
                // Create a new image
                var _0x111D7 = new Image()
                _0x111D7.crossOrigin = "anonymous"

                // Determine the URL to use
                let imageUrl = url
                if (useProxy && proxyIndex < corsProxies.length) {
                    imageUrl = corsProxies[proxyIndex] + encodeURIComponent(url)
                    console.log(`Trying mother cell with CORS proxy ${proxyIndex + 1}/${corsProxies.length}: ${corsProxies[proxyIndex]}`)
                }

                _0x111D7.addEventListener("load", function () {
                    customAssets.aCustomMother = PIXI.Texture.from(_0x111D7)

                    // Update all mother cells to use the new texture
                    for (var _0x111EE in player1.bucket) {
                        var _0x11205 = player1.bucket[_0x111EE]
                        if (_0x11205.type == 4) {
                            _0x11205.needsPixiUpdate = true
                        }
                    }

                    // Notify user of success
                    player1.selfMsg("Mother cell skin loaded successfully!")
                })

                _0x111D7.addEventListener("error", function (e) {
                    console.error("Error loading mother cell skin:", e)

                    if (!useProxy) {
                        // First failure, try with proxy
                        player1.selfMsg("Unable to load custom mother cell skin directly. Trying with CORS proxy...")
                        loadMotherImage(url, true, 0)
                    } else if (proxyIndex < corsProxies.length - 1) {
                        // Try next proxy
                        loadMotherImage(url, true, proxyIndex + 1)
                    } else {
                        // All proxies failed
                        player1.selfMsg("Failed to load mother cell skin. Please try a different image URL.")
                    }
                })

                // Set the source to start loading
                _0x111D7.src = imageUrl
            }

            // Start loading the image
            loadMotherImage(_0x1121C)
        }
    }
    function showCoordAdjust() {
        if (!clientSettings.cShowCoordinates) {
            $("#minimap-canvas").css({
                "border-top": "0"
            })
            $("#minimap-panel").css({
                height: "250px"
            })
        } else {
            $("#minimap-canvas").css({
                "border-top": "2px solid rgba(255, 255, 255, .2)"
            })
            $("#minimap-panel").css({
                height: "270px"
            })
        }
    }
    function _0x11E54() {
        _0x1253F()
        $("#btn-chg-ln").on("click", function () {
            if (!isAccountLocked) {
                return
            }
            var _0x111EE = prompt("Enter new locked name!")
            if (!_0x111EE) {
                return
            }
            var _0x111D7 = null
            if (typeof _0x111EE !== "string") {
                _0x111D7 = "Please enter a valid name!"
            }
            if (_0x111EE.length < 2) {
                _0x111D7 = "Locked names must be 2 or more characters long."
            }
            if (_0x111EE.length > 20) {
                _0x111D7 = "Locked names must be 20 or less characters long."
            }
            if (_0x111D7 !== null) {
                alert(_0x111D7)
                return
            }
            _0x111EE = _0x111EE.trim()
            if (confirm("You are about to change your locked name to: '" + _0x111EE + "'.\nLocked names can only be changed once per week.\n\nAre you sure you wish to continue?")) {
                player1.sendPacket(new network.sendLockedNameChange(_0x111EE))
            }
        })
        $("#btn-updateSP").on("click", function () {
            _0x127DA()
        })
        $("#btn-subpanel-rules").on("click", function () {
            subPanelSettings.rules = true
            _0x127F1()
        })
    }
    function _0x1253F() {
        _0x127F1()
        $("#spNameColor").spectrum({
            color: subPanelSettings.nameColor,
            showAlpha: false,
            showInput: true,
            preferredFormat: "rgb"
        })
        $("#spChatColor").spectrum({
            showPaletteOnly: true,
            showPalette: true,
            color: _0x114A0[subPanelSettings.chatColor],
            palette: _0x114A0
        })
        $("#spSkinName").val(subPanelSettings.skinName)
        $("#spLowerName").prop("checked", subPanelSettings.lowerName)
        $("#spEffect select").val(subPanelSettings.effect)
        $("#spNameFont select").val(subPanelSettings.nameFont)
    }
    function _0x127DA(_0x1121C) {
        subPanelSettings.skinName = $("#spSkinName").val().toLowerCase()
        subPanelSettings.lowerName = $("#spLowerName").prop("checked")
        subPanelSettings.nameColor = $("#spNameColor").spectrum("get").toRgb()
        var _0x111EE = $("#spChatColor").spectrum("get").toHexString().toUpperCase()
        var _0x111D7 = 0
        for (var _0x11205 = 0; _0x11205 < _0x114A0.length; _0x11205++) {
            if (_0x114A0[_0x11205] == _0x111EE) {
                _0x111D7 = _0x11205
                break
            }
        }
        subPanelSettings.chatColor = _0x111D7
        subPanelSettings.effect = parseInt($("#spEffect").val())
        subPanelSettings.nameFont = parseInt($("#spNameFont").val())
        player1.sendPacket(new network.sendSubPanel(_0x1121C))
    }
    function _0x127F1() {
        if (isAccountLocked || player1.subPanelOverride) {
            $("#btn-cellpanel").prop("disabled", false)
            if (isAccountLocked) {
                $(".subpanel-name-dashboard").css("display", "")
            } else {
                $(".subpanel-name-dashboard").css("display", "none")
            }
            if (subPanelSettings.rules) {
                $("#subpanel-rules").css("display", "none")
                $("#subpanel-content").css("display", "block")
            } else {
                $("#subpanel-content").css("display", "none")
                $("#subpanel-rules").css("display", "block")
            }
        } else {
            $("#btn-cellpanel").prop("disabled", true)
        }
    }
    function _0x11D6E(_0x111D7) {
        if (!player1.accountListeners.loadSubPanel) {
            player1.accountListeners.loadSubPanel = fb_app1
                .firestore()
                .collection("accounts")
                .doc(_0x111D7)
                .onSnapshot(
                    (_0x111D7) => {
                        if (!_0x111D7.exists || !_0x111D7.data().locked) {
                            isAccountLocked = false
                            if ($("#main-subpanel").css("display") !== "none") {
                                show_side_menu("main-servers")
                            }
                        } else {
                            isAccountLocked = true
                            $("#spLockedName").html(_0x111D7.data().name)
                            if (_0x111D7.data().lastChange !== undefined) {
                                $("#btn-chg-ln").attr("title", "Last Changed: " + new Date(_0x111D7.data().lastChange).toLocaleString())
                            }
                            if (_0x111D7.data().expiry !== null) {
                                $("#spExpiry").html(new Date(_0x111D7.data().expiry.seconds * 1e3).toLocaleString())
                            } else {
                                $("#spExpiry").html("Never")
                            }
                        }
                        _0x127F1()
                        player1.accountListeners.loadSubPanel()
                        player1.accountListeners.loadSubPanel = null
                    },
                    (_0x111D7) => {
                        player1.accountListeners.loadSubPanel()
                        player1.accountListeners.loadSubPanel = null
                    }
                )
        }
    }
    function ServerInfo(_0x1121C, _0x111EE, _0x1124A, _0x111D7, _0x11261, _0x11205, _0x11278, _0x1128F, _0x11233) {
        this.name = _0x1121C
        this.ip = _0x111EE
        this.players = _0x1124A
        this.bots = _0x111D7
        this.playerText = _0x11261
        this.mode = _0x11205
        this.region = _0x11278
        this.ssl = _0x1128F
        this.order = _0x11233
    }
    /**
     * Update the server list UI
     */
    function updateServerListUI() {
        $("#servers-body-eu").html("")
        $("#servers-body-na").html("")

        for (var region in serverList) {
            for (var i in serverList[region]) {
                var server = serverList[region][i]
                var pingClass = "ping-low" // u can make dynamic later if u want
                var listItem = `
                        <li class="server-item" data-server-id="${server.name}" tabindex="0">
                            <div class="server-info">
                                <span class="server-name">${server.name}</span>
                                <span class="server-region">${server.mode}</span>
                            </div>
                            <div class="server-status">
                                <span class="server-players">${server.playerText}</span>
                            </div>
                        </li>
                    `
                $("#servers-body-" + server.region).append(listItem)
            }
        }

        $(".server-item").on("click", function () {
            $(".server-item").removeClass("selected")
            $(this).addClass("selected")
            selectServer($(this).attr("data-server-id"))
        })
    }

    function _0x119BF(_0x111D7) {
        for (var _0x111EE in _0x11205) {
            if (_0x111D7.toLowerCase() === _0x111EE.toLowerCase()) {
                return _0x11205[_0x111EE]
            }
        }
        return null
    }
    /**
     * Find a server by name in the server list
     * @param {string} serverName - The name of the server to find
     * @returns {Object|null} The server object if found, null otherwise
     */
    function findServerByName(serverName) {
        for (var region in serverList) {
            for (var name in serverList[region]) {
                if (name.toLowerCase() === serverName.toLowerCase()) {
                    return serverList[region][name]
                }
            }
        }
        return null
    }
    /**
     * Select a server by name and update the UI
     * @param {string} serverName - The name of the server to select
     */
    function selectServer(serverName) {
        // Deselect the previously selected server in the UI
        if (selectedServer != null) {
            $("#s_" + selectedServer.name).removeClass("server-selected")
        }

        // Find the server by name or use a fallback method
        selectedServer = findServerByName(serverName) || (Object.keys(_0x11205).length > 0 ? _0x119BF(serverName) : null)

        // Highlight the newly selected server in the UI
        if (selectedServer != null) {
            $("#s_" + selectedServer.name).addClass("server-selected")
        }
    }
    function setActiveServerTab(_0x111D7) {
        _0x111D7 = _0x111D7.toLowerCase()
        var _0x111EE = $("#server-tab-" + _0x111D7)
        $("#server-tab-container").children().removeClass("server-active")
        _0x111EE.addClass("server-active")
        $("#server-content").children().css("display", "none")
        $("#servers-" + _0x111D7).css("display", "block")
    }
    /**
     * Add a message to the chat tabs
     * @param {number} messageFlags - The flags indicating which chat tabs should receive the message
     * @param {HTMLElement} messageElement - The message element to add to the chat
     */
    /**
     * Add a message to the chat
     * @param {number} messageFlags - Flags indicating which chat tabs should receive the message
     * @param {HTMLElement} messageElement - The message element to add
     */
    function addChatMessage(messageFlags, messageElement) {
        // Check if required parameters are valid
        if (!messageElement || !clientSettings || !clientSettings._ChatTabs) {
            console.warn("Invalid parameters for addChatMessage")
            return
        }

        var cloneCount = 0
        for (tab in clientSettings._ChatTabs) {
            var chatTab = clientSettings._ChatTabs[tab]
            if (!chatTab || !chatTab.flags || (messageFlags & chatTab.flags) != messageFlags) {
                continue
            }

            // Check if chat body exists
            const chatBodySelector = "#chat-body-" + tab
            const $chatBody = $(chatBodySelector)
            if ($chatBody.length === 0) {
                continue
            }

            // Manage message count
            var messageCount = $chatBody.find("tr").length
            if (messageCount >= chatTab.maxMessages) {
                $chatBody.find("tr:first-child").remove()
            }

            // Clone message element if needed
            var msgElement = cloneCount > 0 ? messageElement.cloneNode(true) : messageElement
            cloneCount++

            // Create table row and append message
            var tableRow = document.createElement("tr")
            tableRow.appendChild(msgElement)

            // Get chat body DOM element and append row
            const chatBody = document.getElementById("chat-body-" + tab)
            if (chatBody) {
                chatBody.appendChild(tableRow)
            }
            var chatContainer = $("#chat-container-" + tab)
            if (chatContainer.length > 0 && chatContainer[0].scrollHeight - chatContainer[0].scrollTop < chatContainer.outerHeight() + 150) {
                chatContainer.scrollTop(chatContainer[0].scrollHeight)
            }
        }
    }
    /**
     * Handle sending a chat message
     * @param {string} message - The message to send
     */
    function handleChatMessage(message) {
        if (message.length == 0) {
            return
        } else {
            if (message.charAt(0) == "/") {
                processChatCommand(message)
            } else {
                getActivePlayer().sendPacket(new network.sendChat(message, 0))
                setChatInputValue("")
            }
        }
        // Store chat message in history (max 20 messages)
        if (chatHistory.length > 20) {
            chatHistory.shift()
        }
        chatHistory.push(message)
    }
    /**
     * Set the value of the chat input field
     * @param {string} value - The value to set
     */
    function setChatInputValue(value) {
        $("#chat-input").val(value)
    }
    /**
     * Append text to the chat input field
     * @param {string} text - The text to append
     */
    function appendToChatInput(text) {
        $("#chat-input").val($("#chat-input").val() + text)
    }
    /**
     * Process a chat command (message starting with /)
     * @param {string} message - The command message to process
     */
    function processChatCommand(message) {
        var parts = message.split(" ")
        var firstPart = parts[0]
        var command = firstPart.substring(1)
        setChatInputValue("")
        var commandProcessed = false

        // Look through available commands
        Object.keys(_0x11610).findIndex((key) => {
            if (
                _0x11610[key].triggers.findIndex((trigger) => {
                    return trigger.toUpperCase() === command.toUpperCase()
                }) > -1
                && commandProcessed == false
            ) {
                _0x11610[key].action(parts.slice(1))
                commandProcessed = true
                return
            }
        })

        if (commandProcessed == false) {
            player1.selfMsg("Invalid command!")
        }
    }
    function _0x12317() {
        var _0x111EE = $("#chat-tab-container")
        var _0x111D7 = $("#chat-container")
        _0x111EE.empty()
        _0x111D7.empty()
        for (var _0x11205 in clientSettings._ChatTabs) {
            var _0x1121C = clientSettings._ChatTabs[_0x11205]
            if (_0x1121C.name.length == 0) {
                _0x1121C.name = "Unnamed"
            }
            _0x111EE.append("<li class='chat-tab' id='chat-tab-" + _0x11205 + "' name='" + _0x11205 + "'><span>" + _0x1121C.name + "</span></li>")
            _0x111D7.append("<div class='chat-inner-container' id='chat-container-" + _0x11205 + "'><table class='chat-table'><tbody id='chat-body-" + _0x11205 + "'></tbody></table></div>")
        }
        $(".chat-tab")
            .on("click", function () {
                _0x12414($(this).attr("name"))
            })
            .css("border-color", uiTheme.uiBorderColor)
        // Use the current chat tab index if valid, otherwise use 0
        if (currentChatTabIndex >= 0 && currentChatTabIndex < clientSettings._ChatTabs.length) {
            _0x12414(currentChatTabIndex)
        } else {
            _0x12414(0)
        }
    }
    function _0x1232E() {
        for (var _0x111D7 in clientSettings._ChatTabs) {
            var _0x111EE = clientSettings._ChatTabs[_0x111D7]
            if (!_0x111EE) {
                continue
            }
            if (_0x111EE.name.length == 0) {
                _0x111EE.name = "Unnamed"
            }
            var _0x11205 = $("#chat-tab-" + _0x111D7)
            if (_0x11205) {
                _0x11205.html("<span>" + _0x111EE.name + "</span>")
            }
        }
    }
    function _0x12414(_0x111D7) {
        $(".chat-tab").removeClass("chat-active-tab")
        $(".chat-inner-container").removeClass("chat-active-container").css("display", "none")
        currentChatTabIndex = _0x111D7
        var _0x111EE = clientSettings._ChatTabs[_0x111D7]
        if (!_0x111EE) {
            return
        }
        $("#chat-tab-" + _0x111D7).addClass("chat-active-tab")
        $("#chat-container-" + _0x111D7)
            .addClass("chat-active-container")
            .css("display", "block")
    }
    function _0x1135E(_0x11205 = 0) {
        var _0x111D7 = $("#cte-tab-selector")
        _0x111D7.empty()
        for (var _0x111EE in clientSettings._ChatTabs) {
            _0x111D7.append("<option value='" + _0x111EE + "'>" + clientSettings._ChatTabs[_0x111EE].name + "</option>")
        }
        _0x111D7.prop("selectedIndex", _0x11205)
        _0x111D7.trigger("change")
    }
    function _0x114FC(_0x11205) {
        var _0x1124A = $("#cte-tab-selector").val()
        var _0x11233 = {
            name: "",
            flags: 0,
            maxMessages: 0
        }
        var _0x111EE = clientSettings._ChatTabs[_0x1124A]
        if (_0x111EE) {
            for (var _0x1121C in _0x11233) {
                _0x11233[_0x1121C] = _0x111EE[_0x1121C]
            }
        }
        $("#cte-tab-name").val(_0x11233.name)
        for (var _0x11261 in ChatTabFlags) {
            var _0x111D7 = (ChatTabFlags[_0x11261] & _0x11233.flags) == ChatTabFlags[_0x11261]
            $("#cte-type-" + _0x11261.toLowerCase()).prop("checked", _0x111D7)
        }
        $("#cte-max-messages").val(_0x11233.maxMessages)
    }
    function _0x1152A(_0x111D7) {
        var _0x1121C = $("#cte-tab-selector").val()
        var _0x11278 = clientSettings._ChatTabs[_0x1121C]
        if (!_0x11278) {
            return
        }
        var _0x11261 = _0x11278.name
        var _0x1124A = $("#cte-tab-name").val()
        if (_0x1124A.length == 0) {
            return
        }
        var _0x11205 = _0x1124A != _0x11261
        var _0x111EE = 0
        var _0x11233 = parseInt($("#cte-max-messages").val())
        for (var _0x1128F in ChatTabFlags) {
            if ($("#cte-type-" + _0x1128F.toLowerCase()).prop("checked")) {
                _0x111EE += ChatTabFlags[_0x1128F]
            }
        }
        _0x11278.name = _0x1124A
        _0x11278.flags = _0x111EE
        _0x11278.maxMessages = _0x11233
        if (_0x11205) {
            _0x1135E(_0x1121C)
            _0x1232E()
        }
    }
    function _0x114CE() {
        var _0x111D7 = {
            name: "New",
            flags: 0,
            maxMessages: 100
        }
        clientSettings._ChatTabs.push(_0x111D7)
        _0x1135E(clientSettings._ChatTabs.length - 1)
        _0x12317()
    }
    function _0x114E5() {
        var _0x111D7 = $("#cte-tab-selector").val()
        var _0x111EE = clientSettings._ChatTabs[_0x111D7]
        if (!_0x111EE) {
            return
        }
        clientSettings._ChatTabs.splice(_0x111D7, 1)
        _0x1135E()
        _0x12317()
    }
    function _0x11513(_0x11233) {
        var _0x111D7 = parseInt($("#cte-tab-selector").val())
        var _0x1121C = clientSettings._ChatTabs[_0x111D7]
        if (!_0x1121C) {
            return
        }
        var _0x111EE
        if (_0x11233) {
            _0x111EE = _0x111D7 - 1
        } else {
            _0x111EE = _0x111D7 + 1
        }
        var _0x11205 = clientSettings._ChatTabs[_0x111EE]
        if (!_0x11205) {
            return
        }
        clientSettings._ChatTabs[_0x111D7] = _0x11205
        clientSettings._ChatTabs[_0x111EE] = _0x1121C
        _0x1135E(_0x111EE)
        _0x1232E()
        _0x12414(_0x111EE)
    }

    function darkenColor(color, percent) {
        const num = parseInt(color?.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 255) - amt;
        const B = (num & 255) - amt;
        return '#' + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1).toUpperCase();
    }

    function lightenColor(color, percent) {
        if (!color) {
            return color;
        }
        color = color.replace(/^#/, '');
        const num = parseInt(color, 16);
        let R = (num >> 16) + percent;
        let G = (num >> 8 & 255) + percent;
        let B = (num & 255) + percent;
        R = R > 255 ? 255 : R < 0 ? 0 : R;
        G = G > 255 ? 255 : G < 0 ? 0 : G;
        B = B > 255 ? 255 : B < 0 ? 0 : B;
        const lightenColor = '#' + (R << 16 | G << 8 | B).toString(16).padStart(6, '0');
        return lightenColor;
    }

    var onChatNameContextMenu = function (event) {
        displayContextUI(event, this.innerText, this.dataset.playerId, -1, this.dataset.id);
    }
    var handlePartyContextMenuClick = function (e) {
        var offsetY = e.offsetY
        var partyIndex = Math.floor(offsetY / 20)
        if (offsetY % 20 < 5) {
            return
        }
        var partyMember = player1.party[partyIndex]
        if (partyMember == null) {
            return
        }
        displayContextUI(e, partyMember.name, partyMember.id, partyIndex)
    }

    // playerName, playerId, partyIndex, cellColor, skin
    function displayContextUI(e, playerName, playerId, partyIndex, cellId, cellColor, skin) {
        var playerNameElem = document.getElementById("context-name")

        $('#context-name').removeAttr('style');
        $('#context-name').css('color', lightenColor(cellColor, 200));

        var player = getActivePlayer();
        playerNameElem.innerHTML = `
           ${cellColor ? `<span style="
           width: ${skin != null ? '30px' : '28px'};
           height: ${skin != null ? '30px' : '28px'};
           display: inline-block;
           background-color: ${cellColor};
           border-radius: 100%;
           ${skin != null ? `
               background-image: url(${skin});
               background-size: contain;
           ` : `
               border: 2px solid ${darkenColor(cellColor, 15)};
           ` }
         "></span>` : ``}
           <span style="margin: 0 5px">${playerName.includes('🤖') && clientSettings.cReplaceBotsName ? '🤖' : playerName || 'An unnamed cell'}</span>
         `

        contextMenu.data("selected", playerId)
        contextMenu.data("party", partyIndex)
        contextMenu.data('cellId', cellId);

        console.log(cellId);

        $('.context-action').hide();

        if (!playerName.includes('🤖')) {
            $('#menu-profile').show();
            $('#menu-invite').show();
        }
        if (player.playerId == playerId) {
            $('#menu-profile').hide();
            if (player1.party.length) {
                $('#menu-leave-party').show();
            } else {
                $('#menu-invite').text('Create Party');
                $('#menu-add-multi').show()
            }
        }
        if (player.playerId !== playerId) {
            if (!playerName.includes('🤖')) {
                $("#menu-whisper").show()
                $("#menu-block").show()
                $("#menu-invite").text("Invite To Party")
                $("#menu-profile").text("Profile")
            }

            if (player.spectate) {
                $("#menu-spectate").show()
            }
        }

        if (player.party.map(item => item.name).includes(playerName)) {
            $('#menu-invite').hide();
        }
        if (player.isPartyLeader() && player.party.map(item => item.name).includes(playerId)) {
            if (player.playerId == playerId) {
                $('#menu-pu_pr').show();
            } else {
                $('#menu-promote').show();
                $('#menu-kick').show();
            }
        }
        if (player.party.length > 0 && !player.isPartyLeader()) {
            $('#menu-invite').hide();
        }


        $(contextMenuElem).fadeIn(100)
        contextMenuElem.css('scale', '1')
        contextMenuElem.css("left", Math.min(player.mouseRawX, window.innerWidth - contextMenuElem.width()))
        contextMenuElem.css("top", Math.min(player.mouseRawY, window.innerHeight - contextMenuElem.height()))
    }

    function minimapDrawMarker(context, icon, message, cellX, cellY, partyFlag, coloring, opacity) {
        var _0x11205 = (cellX - player1.serverData.border.left) / player1.serverData.border.width * minimap_canvas.width;
        var _0x1121C = (cellY - player1.serverData.border.top) / player1.serverData.border.height * minimap_canvas.height;
        context.globalAlpha = opacity;
        context.font = '24px \'Material Icons\'';
        context.fillStyle = coloring;
        context.fillText(icon, _0x11205 - 12, _0x1121C - 2);
        context.shadowBlur = 20;
        context.shadowColor = '#FFFFFF';
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.beginPath();
        context.arc(_0x11205, _0x1121C, (1 - opacity * opacity) * 60, 0, 2 * Math.PI);
        context.strokeStyle = coloring;
        context.lineWidth = opacity * 5;
        context.closePath();
        context.stroke();
        context.beginPath();
        context.arc(_0x11205, _0x1121C, (1 - opacity * opacity) * 60 + 6, 0, 2 * Math.PI);
        context.strokeStyle = coloring;
        context.lineWidth = 2;
        context.closePath();
        context.stroke();
        context.globalAlpha = 1;
        context.shadowBlur = 0;
        if (partyFlag) {
            var _0x1128F = context.measureText(message).width / 2;
            var _0x11261 = _0x11205 - _0x1128F;
            var _0x11278 = _0x1121C - 5;
            context.fillText(message, _0x11261, _0x11278);
        }
    }

    function mainMapDrawMarker(container, icon, message, cellX, cellY, partyFlag, coloring, opacity) { }
    function minimapDrawPlayer(context, cellName, cellX, cellY, cellSize, coloring, partyFlag) {
        var _0x11205 = ((cellX - player1.serverData.border.left) / player1.serverData.border.width) * minimap_canvas.width
        var _0x1121C = ((cellY - player1.serverData.border.top) / player1.serverData.border.height) * minimap_canvas.height
        context.beginPath()
        context.arc(_0x11205, _0x1121C, cellSize, 0, TWO_PI, false)
        context.fillStyle = coloring
        context.fill()
        if (partyFlag) {
            var _0x1128F = context.measureText(cellName).width / 2
            var _0x11261 = _0x11205 - _0x1128F
            var _0x11278 = _0x1121C - 5
            context.fillText(cellName, _0x11261, _0x11278)
        }
    }
    // Shows the context menu based on the cell clicked under the mouse
    // Now uses the currently active player (player1 or player2)
    function _0x1156F(event) {
        // event object might be useful
        const activePlayer = getActivePlayer()
        // Get the currently active player (player1 or player2)

        if (!activePlayer) {
            console.warn("Context menu requested but no active player found.")
            return
            // Should not happen if game is running
        }

        // Calculate mouse position in game coordinates based on the ACTIVE player's view
        const currentGameScale = activePlayer.scale
        // Use active player's scale
        // Use gameContainer pivot and stage position which are set by the gameLoop based on active player
        const mouseGameX = gameContainer.pivot.x - app.stage.position.x / currentGameScale + (activePlayer.mouseRawX * clientOptions.resolution) / currentGameScale
        const mouseGameY = gameContainer.pivot.y - app.stage.position.y / currentGameScale + (activePlayer.mouseRawY * clientOptions.resolution) / currentGameScale

        let foundCell = null

        // Iterate through the ACTIVE player's cell bucket (Map)
        for (const currentCell of activePlayer.bucket.values()) {
            // Standard size and hit-testing checks
            if (!currentCell || currentCell.size < 25) {
                // Use interpolated 'size'
                continue
            }

            const cellTop = currentCell.y - currentCell.size
            const cellBottom = currentCell.y + currentCell.size
            const cellLeft = currentCell.x - currentCell.size
            const cellRight = currentCell.x + currentCell.size

            if (mouseGameY > cellBottom || mouseGameY < cellTop || mouseGameX > cellRight || mouseGameX < cellLeft) {
                continue
                // Skip if mouse is outside this cell
            }

            // Hit!
            foundCell = currentCell
            break
            // Found the first cell under the cursor
        }

        // Show menu if a valid cell was found
        if (foundCell && foundCell.playerId !== 0 && (!event || event.target.id === "canvas")) {
            // Use the ACTIVE player's registry to get player data
            const playerData = activePlayer.playerRegistry.getPlayer(foundCell.playerId)
            // Assumes getPlayer uses Map.get internally

            if (playerData) {
                // displayContextUI(event, playerData.name, foundCell.playerId, -1, '#' + playerData.cellColor.toString(16).padStart(6, '0'), playerData.skin)

                console.log(foundCell);
                console.log(playerData);

                displayContextUI(event, playerData.name, playerData.id, -1, foundCell.id, foundCell.color, playerData.skin);


                // Call the function to display the context menu UI
                // displayContextUI likely uses the active player's state implicitly
                // to determine which options (invite, kick, etc.) are valid.
            } else {
                // console.warn(`Could not find player data in registry for ID: ${foundCell.playerId}`);
                // Optionally show menu with just ID?
                // displayContextUI(event, `ID: ${foundCell.playerId}`, foundCell.playerId, -1);
            }
        }
    }
    function showUIElement(_0x111D7) {
        if (_0x111D7.css("display") == "none") {
            _0x111D7.css("display", "block")
            _0x111D7.animate(
                {
                    opacity: 1
                },
                500
            )
        }
    }
    /**
     * Hide a UI element with a fade-out animation
     * @param {jQuery} element - The jQuery element to hide
     */
    function hideUIElement(element) {
        if (element.css("display") == "block" && element.css("opacity") == 1) {
            element.animate(
                {
                    opacity: 0
                },
                500,
                function () {
                    element.css("display", "none")
                }
            )
        }
    }

    /**
     * Hide game UI elements with a fade-out animation
     * @param {jQuery} element - The jQuery element to hide
     */
    function showGameUI(element) {
        if (element.css("display") == "block" && element.css("opacity") == 1) {
            element.animate(
                {
                    opacity: 0
                },
                500,
                function () {
                    element.css("display", "none")
                }
            )
        }
    }
    function showMainUI(_0x111D7) {
        if (_0x111D7.css("display") == "block" && _0x111D7.css("opacity") == 1) {
            mainMenuVisible = !mainMenuVisible
            hideUIElement(_0x111D7)
        } else {
            if (_0x111D7.css("display") == "none") {
                showUIElement(_0x111D7)
                mainMenuVisible = !mainMenuVisible
            }
        }
    }
    function _0x11B74() {
        $(".popup-panel").each(function () {
            hideUIElement($(this))
        })
    }
    /**
     * Show HUD elements based on user settings
     */
    function showHudElements() {
        hudPanel.show()

        // Hide party panel if no party members or setting enabled
        if (player1.party.length == 0 || clientSettings.cHidePartyPanel) {
            hudElements.partyPanel.css("display", "none")
        }

        // Hide chat if setting enabled
        if (clientSettings.cHideChat) {
            $("#chat-panel").css("display", "none")
        }

        // Hide minimap if setting enabled
        if (clientSettings.cHideMinimap) {
            $("#minimap-panel").css("display", "none")
        }
    }
    function _0x11B46() {
        hudPanel.hide()
    }
    function showAccountLoading() {
        $("#guest").hide()
        $("#account-loader").show()
    }
    function showAccount2Loading() {
        $("#guest2").hide()
        $("#account2-loader").show()
    }
    /**
     * Show the guest UI and hide other account-related UI elements
     */
    function showGuestUI() {
        $("#authed").hide()
        $("#account-loader").hide()
        $("#no_cookie_consent").hide()
        $("#guest").show()
    }
    function showGuest2UI() {
        $("#authed2").hide()
        $("#account2-loader").hide()
        $("#no_cookie_consent2").hide()
        $("#guest2").show()
    }
    /**
     * Handle checkbox option changes
     * @param {jQuery} element - The checkbox element that changed
     */
    function handleCheckboxChange(element) {
        var settingId = element.attr("id")
        clientSettings[settingId] = element.prop("checked")
        updateUIColor(settingId)
    }

    /**
     * Handle select option changes
     * @param {jQuery} element - The select element that changed
     */
    function handleSelectChange(element) {
        var settingId = element.attr("id")
        clientSettings[settingId] = element.val()
        updateUIColor(settingId, element.val())
    }
    /**
     * Update range input display value
     * @param {jQuery} rangeInput - jQuery object for the range input
     */
    function updateRangeInput(rangeInput) {
        var inputId = rangeInput.attr("id")
        updateUIColor(inputId, rangeInput.val())
    }

    /**
     * Handle text input changes
     * @param {jQuery} element - The input element that changed
     */
    function handleInputChange(element) {
        var settingId = element.attr("id")
        clientSettings[settingId] = element.val()
        updateUIColor(settingId, element.val())
    }
    /**
     * Update UI color based on setting ID and value
     * @param {string} settingId - ID of the setting to update
     * @param {string|number} value - New value for the setting
     */
    function updateUIColor(settingId, value) {
        var handler = settingHandlers[settingId]
        if (handler != null) {
            handler(value)
        }
    }
    /**
     * Update asset setting based on setting ID and value
     * @param {string} settingId - ID of the setting to update
     * @param {string} value - New value for the setting
     */
    function updateAssetSetting(settingId, value) {
        if (value != null) {
            uiTheme[settingId] = value
            updateUIColor(settingId, value)
        }
    }
    /**
     * Saves user settings to local storage
     */
    // Add a variable to track the last save time
    var lastSettingsSaveTime = 0
    var settingsSaveTimeout = null

    /**
     * Saves user settings to local storage with debounce to prevent excessive saves
     */
    function saveUserSettings() {
        // Clear any pending save timeout
        if (settingsSaveTimeout) {
            clearTimeout(settingsSaveTimeout);
        }

        // Set a timeout to save settings after a short delay
        settingsSaveTimeout = setTimeout(function () {
            // Update chat panel dimensions if they exist
            const chatPanel = document.getElementById("chat-panel");
            if (chatPanel) {
                clientSettings.iChatWidth = chatPanel.style.width || getComputedStyle(chatPanel).width;
                clientSettings.iChatHeight = chatPanel.style.height || getComputedStyle(chatPanel).height;
            }

            // Sync rSlider values to their non-r counterparts if inputs exist
            // These seem like they store the *actual* value used by sliders/inputs
            // bound elsewhere, while the r-prefixed ones are used internally by the game loop?
            // Need to be careful about the source of truth. Assuming the non-r are the primary state holders.
            if (document.getElementById('animationDelay')) clientSettings.animationDelay = clientSettings.rAnimationDelay;
            if (document.getElementById('camDelay')) clientSettings.camDelay = clientSettings.rCamDelay;
            if (document.getElementById('uiScale')) clientSettings.uiScale = clientSettings.rUiScale;
            if (document.getElementById('viewDistance')) clientSettings.viewDistance = clientSettings.rViewDistance;
            if (document.getElementById('reconnectPeriod')) clientSettings.reconnectPeriod = clientSettings.rReconnectPeriod;

            // Save all settings to localStorage
            try {
                window.localStorage.setItem('options', JSON.stringify(clientSettings));
                window.localStorage.setItem('keybinds', JSON.stringify(keyMappings));
                const nameBox = document.getElementById("name-box");
                const nameBox2 = document.getElementById("name-box2");
                if (nameBox) window.localStorage.setItem('name', nameBox.value);
                if (nameBox2) window.localStorage.setItem('name2', nameBox2.value);
                window.localStorage.setItem('theme', JSON.stringify(uiTheme));
                window.localStorage.setItem('subpanel', JSON.stringify(subPanelSettings));

                // Update last save time
                lastSettingsSaveTime = Date.now();
                console.log("Settings saved at: " + new Date(lastSettingsSaveTime).toLocaleTimeString()); // Log save time
            } catch (e) {
                console.error("Error saving settings to localStorage:", e);
                // Potentially notify the user if storage is full
            }

            settingsSaveTimeout = null; // Clear the timeout ID
        }, 300); // 300ms debounce delay
    }


    function _0x11DB3() {
        if (!_0x1163E.consented) {
            return
        }
        var _0x112A6 = window.localStorage.getItem("theme")
        if (_0x112A6) {
            loadThemeSettings(_0x112A6)
        }
        var _0x11233 = window.localStorage.getItem("keybinds")
        if (_0x11233) {
            _0x11233 = JSON.parse(_0x11233)
            for (var _0x11205 in _0x11233) {
                if (_0x11233[_0x11205] != null && Number.isInteger(_0x11233[_0x11205])) {
                    keyMappings[_0x11205] = _0x11233[_0x11205]
                    updateKeybindText($("#" + _0x11205))
                }
            }
            loadKeybindsCache()
            // Initialize the fast cache AFTER loading base keyMappings
        }
        var _0x11261 = window.localStorage.getItem("options")
        if (_0x11261) {
            _0x11261 = JSON.parse(_0x11261)
            for (var _0x1121C in clientSettings) {
                if (_0x1121C in _0x11261 === false) {
                    _0x11261[_0x1121C] = clientSettings[_0x1121C]
                }
            }
        } else {
            _0x11261 = clientSettings
        }
        for (var _0x1121C in _0x11261) {
            var _0x111EE = _0x1121C.charAt(0)
            if (_0x111EE == "c") {
                if (_0x11261[_0x1121C] == true) {
                    var _0x111D7 = $("#" + _0x1121C)
                    _0x111D7.prop("checked", _0x11261[_0x1121C])
                    handleCheckboxChange(_0x111D7)
                }
            } else {
                if (_0x111EE == "s") {
                    var _0x11278 = $("#" + _0x1121C)
                    _0x11278.val(_0x11261[_0x1121C])
                    handleSelectChange(_0x11278)
                } else {
                    if (_0x111EE == "i") {
                        clientSettings[_0x1121C] = _0x11261[_0x1121C]
                    } else {
                        if (_0x111EE == "r") {
                            clientSettings[_0x1121C] = _0x11261[_0x1121C]
                            $("#" + _0x1121C).val(clientSettings[_0x1121C])
                            updateUIColor($("#" + _0x1121C))
                        } else {
                            clientSettings[_0x1121C] = _0x11261[_0x1121C]
                        }
                    }
                }
            }
        }
        $("#chat-panel").css("width", clientSettings.iChatWidth)
        $("#chat-panel").css("height", clientSettings.iChatHeight)
        if (!clientSettings.cThemeEnabled) {
            updateUIColor("cThemeEnabled")
        }
        var _0x1124A = window.localStorage.getItem("name")
        var _0x1124K = window.localStorage.getItem("name2")
        if (_0x1124K != null) {
            $("#name-box2").val(_0x1124K)
        } else {
            $("#name-box2").val(" ")
        }
        if (_0x1124A != null) {
            $("#name-box").val(_0x1124A)
        } else {
            $("#name-box").val(" ")
        }
        var _0x1128F = window.localStorage.getItem("subpanel")
        if (_0x1128F) {
            _0x1128F = JSON.parse(_0x1128F)
            for (var _0x1121C in _0x1128F) {
                if (!_0x1128F[_0x1121C]) {
                    continue
                }
                if (_0x1128F[_0x1121C].length != 0) {
                    subPanelSettings[_0x1121C] = _0x1128F[_0x1121C]
                }
            }
        }
        subPanelSettings.lockedName = ""
        _0x127F1()
    }
    /**
     * Reset UI theme settings to default values
     */
    function resetUIThemeToDefaults() {
        for (var settingKey in defaultUiTheme) {
            var firstChar = settingKey.charAt(0)
            if (firstChar == "r") {
                // Range inputs (sliders)
                $("#" + settingKey).val(defaultUiTheme[settingKey])
                handleSelectChange($("#" + settingKey))
            } else if (firstChar == "u") {
                // Color pickers
                uiTheme[settingKey] = defaultUiTheme[settingKey]
                $("#" + settingKey).spectrum("set", uiTheme[settingKey])
                updateUIColor(settingKey, uiTheme[settingKey])
            } else if (firstChar == "a") {
                // Asset settings
                updateAssetSetting(settingKey, "")
            } else {
                // Other settings
                uiTheme[settingKey] = defaultUiTheme[settingKey]
            }
        }
        uiTheme._FoodColors = []
    }
    /**
     * Load theme settings from JSON string
     * @param {string} themeJson - JSON string containing theme settings
     */
    function loadThemeSettings(themeJson) {
        try {
            var parsedTheme = JSON.parse(themeJson)
            if (parsedTheme.version == null || parsedTheme.version != UI_THEME_VERSION) {
                resetUIThemeToDefaults()
                return
            }
            for (var _0x11205 in _0x1121C) {
                if (uiTheme[_0x11205] != null && _0x1121C[_0x11205].length != 0) {
                    uiTheme[_0x11205] = _0x1121C[_0x11205]
                    var _0x111EE = _0x11205.charAt(0)
                    if (_0x111EE == "u") {
                        $("#" + _0x11205).spectrum("set", uiTheme[_0x11205])
                        updateUIColor(_0x11205, uiTheme[_0x11205])
                    } else {
                        if (_0x111EE == "r") {
                            $("#" + _0x11205).val(uiTheme[_0x11205])
                            updateUIColor($("#" + _0x11205))
                        } else {
                            if (_0x111EE == "a") {
                                updateUIColor(_0x11205, uiTheme[_0x11205])
                            }
                        }
                    }
                }
            }

            // Load cell ring color if it exists
            if (parsedTheme.cellRingColor) {
                uiTheme.cellRingColor = parsedTheme.cellRingColor
                $("#cellRingColor").spectrum("set", uiTheme.cellRingColor)
            }
        } catch (e) {
            resetUIThemeToDefaults()
        } finally {
            updateFoodColors()
        }
    }
    function _0x11E82(_0x111D7) {
        if (/\.(json)$/i.test(_0x111D7.name)) {
            var _0x111EE = new FileReader()
            _0x111EE.addEventListener(
                "load",
                function () {
                    if (!clientSettings.cThemeEnabled) {
                        enableCustomTheme()
                    }
                    resetUIThemeToDefaults()
                    loadThemeSettings(this.result)
                },
                false
            )
            _0x111EE.readAsText(_0x111D7)
        }
    }
    /**
     * Enable custom theme by checking the theme checkbox and triggering change event
     */
    function enableCustomTheme() {
        $("#cThemeEnabled").prop("checked", true).trigger("change")
    }
    function _0x120AA(_0x11205) {
        var _0x1121C = _0x11205.split(" ")
        var _0x111EE = ""
        var _0x11233 = null
        for (var _0x111D7 = 0; _0x111D7 < _0x1121C.length; _0x111D7++) {
            if (_0x111D7 != 0) {
                _0x111EE += " "
            }
            _0x11233 = _0x1121C[_0x111D7]
            if (_0x11838[_0x11233] != null) {
                if (_0x11233.startsWith(":") && _0x11233.endsWith(":")) {
                    _0x11233 = _0x11233.substring(1, _0x11233.length - 1)
                }
                _0x111EE += '<img src="https://gota.io/emotes/' + _0x11233 + '.png" height="17" width="17" alt="' + _0x11233 + '">'
            } else {
                if (gifEmoteList[_0x11233] != null) {
                    if (_0x11233.startsWith(":") && _0x11233.endsWith(":")) {
                        _0x11233 = _0x11233.substring(1, _0x11233.length - 1)
                    }
                    _0x111EE += '<img src="https://gota.io/emotes/gifs/' + _0x11233 + '.gif" height="17" width="17" alt="' + _0x11233 + '">'
                } else {
                    _0x111EE += _0x11233
                }
            }
        }
        return _0x111EE
    }
    /**
     * Powerup type constants
     */
    const POWERUP_TYPES = {
        MODIFIER: 1,
        PASSIVE: 2,
        CONSUMABLE: 3,
        DEBUFF: 4,
        NONE: 0
    }
    var _0x12203, _0x1221A
    /**
     * Powerup definitions
     */
    var powerupDefinitions = {
        0: new PowerupDefinition("Random", "random", POWERUP_TYPES.NONE),
        1: new PowerupDefinition("Maximum Cells Upgrade", "extracells", POWERUP_TYPES.MODIFIER),
        2: new PowerupDefinition("Extra Consumable Slot", "extraconsumable", POWERUP_TYPES.MODIFIER),
        3: new PowerupDefinition("Merge", "merge", POWERUP_TYPES.PASSIVE),
        4: new PowerupDefinition("Grow", "grow", POWERUP_TYPES.PASSIVE),
        5: new PowerupDefinition("Speed", "speed", POWERUP_TYPES.PASSIVE),
        6: new PowerupDefinition("Shield", "shield", POWERUP_TYPES.PASSIVE),
        7: new PowerupDefinition("Virus", "spike", POWERUP_TYPES.CONSUMABLE),
        8: new PowerupDefinition("Disrupt", "disrupt", POWERUP_TYPES.CONSUMABLE),
        9: new PowerupDefinition("Teleport", "teleport", POWERUP_TYPES.CONSUMABLE),
        10: new PowerupDefinition("Disrupt", "_disrupt", POWERUP_TYPES.DEBUFF),
        11: new PowerupDefinition("Silver", "phoenix", POWERUP_TYPES.MODIFIER),
        12: new PowerupDefinition("Consumable Shield", "_shield", POWERUP_TYPES.CONSUMABLE),
        13: new PowerupDefinition("Magnet", "magnet", POWERUP_TYPES.PASSIVE),
        14: new PowerupDefinition("Decay", "decay", POWERUP_TYPES.CONSUMABLE),
        15: new PowerupDefinition("Decay", "_decay", POWERUP_TYPES.DEBUFF)
    }
    /**
     * Constructor for powerup definition
     * @param {string} name - Display name of the powerup
     * @param {string} imgName - Image name for the powerup
     * @param {number} type - Type of powerup from POWERUP_TYPES
     */
    function PowerupDefinition(name, imgName, type) {
        this.name = name
        this.img = imgName
        this.type = type
        this.image = null
        this.texture = null
    }
    function _0x11DCA() {
        for (var _0x111EE in powerupDefinitions) {
            var _0x111D7 = powerupDefinitions[_0x111EE]
            var _0x1121C = "images/powerups/" + _0x111D7.img + ".png"
            var _0x11205 = new Image()
            _0x11205.addEventListener(
                "load",
                function (_0x111D7, _0x111EE) {
                    _0x111D7.texture = PIXI.Texture.from(_0x111EE)
                }.bind(null, _0x111D7, _0x11205)
            )
            _0x11205.src = _0x1121C
            _0x111D7.image = _0x11205
        }
        _0x1221A = PIXI.Texture.from("images/shield.png")
        _0x12203 = PIXI.Texture.from("images/debuff.png")
    }
    /**
     * Constructor for managing player buffs and debuffs
     */
    function buff_holder() {
        this.passiveBuffs = {}
        this.passiveSortedBuffs = []
        this.consumableBuffs = []
        this.cache = null
        this.nextCacheUpdate = 0
        this.texture = null
        this.bonusMaxCells = 0
        this.onAddBuff = function (_0x11205, _0x1121C, _0x111EE) {
            var _0x111D7 = null
            var _0x11233 = powerupDefinitions[_0x11205].type
            if (_0x11233 != POWERUP_TYPES.CONSUMABLE) {
                _0x111D7 = this.passiveBuffs[_0x11205]
                if (_0x111D7) {
                    _0x111D7.update(_0x1121C, _0x111EE)
                } else {
                    _0x111D7 = new PowerupInstance(_0x11205, _0x1121C, _0x111EE)
                    this.passiveBuffs[_0x11205] = _0x111D7
                    this.sortPassiveBuffs()
                }
                this.onPassiveBuffsUpdate()
                this.markCacheForUpdate()
            } else {
                _0x111D7 = new PowerupInstance(_0x11205, _0x1121C, _0x111EE)
                this.consumableBuffs.push(_0x111D7)
                this.markCacheForUpdate()
            }
            if (_0x111D7) {
                player1.selfMsg("Recieved buff: " + _0x111D7.powerup.name)
            }
        }
        this.onRemoveBuff = function (_0x11205) {
            var _0x111D7 = null
            var _0x1121C = powerupDefinitions[_0x11205].type
            if (_0x1121C != POWERUP_TYPES.CONSUMABLE) {
                _0x111D7 = this.passiveBuffs[_0x11205]
                if (_0x111D7) {
                    delete this.passiveBuffs[_0x11205]
                    this.sortPassiveBuffs()
                    this.markCacheForUpdate()
                    this.onPassiveBuffsUpdate()
                }
            } else {
                for (var _0x111EE = 0; _0x111EE < this.consumableBuffs.length; _0x111EE++) {
                    _0x111D7 = this.consumableBuffs[_0x111EE]
                    if (_0x111D7.id == _0x11205) {
                        this.consumableBuffs.splice(_0x111EE, 1)
                        this.markCacheForUpdate()
                        break
                    }
                }
            }
            if (_0x111D7) {
                player1.selfMsg("Lost buff: " + _0x111D7.powerup.name)
            }
        }
        this.clearBuffs = function (_0x1121C) {
            if (this.passiveSortedBuffs.length == 0 && this.consumableBuffs.length == 0) {
                return
            }
            var _0x11205 = _0x1121C ? _0x1121C : false
            for (var _0x111EE in this.passiveBuffs) {
                var _0x111D7 = this.passiveBuffs[_0x111EE]
                if (_0x11205 && _0x111D7.powerup.type == POWERUP_TYPES.MODIFIER) {
                } else {
                    delete this.passiveBuffs[_0x111EE]
                }
            }
            this.sortPassiveBuffs()
            this.onPassiveBuffsUpdate()
            this.consumableBuffs = []
            this.markCacheForUpdate()
        }
        this.sortPassiveBuffs = function () {
            this.passiveSortedBuffs = []
            if (this.passiveBuffs.length == 0) {
                return
            }
            for (var _0x111EE in this.passiveBuffs) {
                var _0x111D7 = this.passiveBuffs[_0x111EE]
                if (_0x111D7.powerup.type == POWERUP_TYPES.MODIFIER) {
                    this.passiveSortedBuffs.splice(0, 0, _0x111EE)
                } else {
                    this.passiveSortedBuffs.push(_0x111EE)
                }
            }
        }
        this.onPassiveBuffsUpdate = function () {
            this.bonusMaxCells = 0
            if (this.passiveBuffs[1] != null) {
                var _0x111D7 = this.passiveBuffs[1]
                this.bonusMaxCells = _0x111D7.stack * 16
            }
        }
        this.update = function () {
            if (this.passiveSortedBuffs.length == 0 && this.consumableBuffs.length == 0) {
                overlaySprite.visible = false
                return
            }
            if (Date.now() >= this.nextCacheUpdate) {
                this.updateCache()
                this.nextCacheUpdate = Date.now() + 1e3
            }
            if (!this.texture) {
                this.texture = PIXI.Texture.from(this.cache.canvas)
                overlaySprite.texture = this.texture
                overlaySprite.anchor.set(0)
            }
            overlaySprite.position.x = scorePanel.style.width + 20 - app.stage.position.x
            overlaySprite.position.y = 15 - app.stage.position.y
            overlaySprite.visible = true
        }
        this.updateCache = function () {
            var _0x111EE = this.cache == null || this.cache.canvas == null ? document.createElement("canvas") : this.cache.canvas
            var _0x1121C = Math.max(this.passiveSortedBuffs.length, this.consumableBuffs.length)
            _0x111EE.width = 55 * _0x1121C
            _0x111EE.height = 105
            this.cache = _0x111EE.getContext("2d")
            this.cache.fillStyle = "#222"
            this.cache.font = "bold 16pt Calibri"
            var _0x11233 = 0,
                _0x1124A = 0
            for (var _0x11205 = 0; _0x11205 < this.passiveSortedBuffs.length; _0x11205++) {
                var _0x111D7 = this.passiveBuffs[this.passiveSortedBuffs[_0x11205]]
                _0x111D7.draw(this.cache, _0x11233, _0x1124A)
                _0x11233 += 55
            }
            _0x11233 = 0
            _0x1124A = 55
            for (var _0x11205 = 0; _0x11205 < this.consumableBuffs.length; _0x11205++) {
                var _0x111D7 = this.consumableBuffs[_0x11205]
                _0x111D7.draw(this.cache, _0x11233, _0x1124A)
                _0x11233 += 55
            }
            if (this.texture) {
                this.texture.update()
            }
            this.nextCacheUpdate = Date.now() + 1e3
        }
        this.markCacheForUpdate = function () {
            this.nextCacheUpdate = 0
        }
    }
    const _0x11319 = Math.PI * 1.5
    /**
     * Constructor for a powerup instance
     * @param {number} id - ID of the powerup
     * @param {number} stack - Stack count for the powerup
     * @param {number} expireTime - Time when the powerup expires
     */
    function PowerupInstance(id, stack, expireTime) {
        this.id = id
        this.powerup = powerupDefinitions[id]
        this.startTime = Date.now()
        this.expireTime = expireTime
        this.stack = stack
        this.update = function (newStack, newExpireTime) {
            this.startTime = Date.now()
            this.expireTime = newExpireTime
            this.stack = newStack
        }
        this.getCooldown = function () {
            if (Date.now() >= this.expireTime) {
                return 2 * Math.PI
            } else {
                var _0x111EE = this.expireTime - Date.now()
                var _0x11205 = this.expireTime - this.startTime
                var _0x111D7 = Math.min(_0x111EE / _0x11205, 1) * 2
                return _0x111D7 * Math.PI
            }
        }
        this.draw = function (_0x111D7, _0x111EE, _0x11205) {
            _0x111D7.drawImage(this.powerup.image, _0x111EE, _0x11205, 50, 50)
            if (this.stack > 1) {
                _0x111D7.fillStyle = "#000"
                _0x111D7.fillText(this.stack, _0x111EE + 35, _0x11205 + 17)
            }
            if (this.expireTime > 0) {
                _0x111D7.beginPath()
                _0x111D7.moveTo(_0x111EE + 25, _0x11205 + 25)
                _0x111D7.arc(_0x111EE + 25, _0x11205 + 25, 25, _0x11319, _0x11319 - this.getCooldown(), false)
                _0x111D7.closePath()
                _0x111D7.globalAlpha = 0.75
                _0x111D7.fillStyle = "#222"
                _0x111D7.fill()
                _0x111D7.globalAlpha = 1
            }
        }
    }
    const heartEmojis = ["hearts"]
    var animatedTextures = []

    /**
     * GifTexture class for handling animated GIF textures
     * Manages loading, storing, and retrieving frames from animated GIFs
     */
    function GifTexture() {
        this.delay = 0
        // Delay between frames in milliseconds
        this.frames = []
        // Array of texture frames
        this.isGif = true
        // Flag indicating this is a GIF texture

        /**
         * Add a frame to the texture
         * @param {PIXI.Texture} frame - The frame to add
         */
        this.push = function (frame) {
            this.frames.push(frame)
        }

        /**
         * Get a specific frame by index
         * @param {number} index - The index of the frame to get
         * @returns {PIXI.Texture} The requested frame
         */
        this.getFrame = function (index) {
            return this.frames[index]
        }

        /**
         * Get the number of frames in the texture
         * @returns {number} The number of frames
         */
        this.getLength = function () {
            return this.frames.length
        }

        /**
         * Get the current frame based on time
         * @returns {PIXI.Texture} The current frame
         */
        this.getTexture = function () {
            return this.getFrame(Math.floor(lastFrameTime / this.delay) % this.getLength())
        }

        /**
         * Load frames from GIF frame data
         * @param {Array} frameData - Array of frame data objects
         */
        this.loadFromFrameData = function (frameData) {
            if (frameData.length === 0) {
                return
            }

            const bufferCanvas = document.createElement("canvas")
            const bufferContext = bufferCanvas.getContext("2d")
            const compositeCanvas = document.createElement("canvas")
            const compositeContext = compositeCanvas.getContext("2d")
            const firstFrame = frameData[0].getImage()

            this.delay = frameData[0].frameInfo.delay * 10

            bufferCanvas.width = firstFrame.width
            bufferCanvas.height = firstFrame.height
            compositeCanvas.width = firstFrame.width
            compositeCanvas.height = firstFrame.height

            for (const frame of frameData) {
                // Save the current composite state to buffer
                bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height)
                bufferContext.drawImage(compositeCanvas, 0, 0)

                // Get the current frame image
                const frameCanvas = frame.getImage()
                const frameContext = frameCanvas.getContext("2d")

                // Draw the current frame onto the composite
                compositeContext.drawImage(frameCanvas, 0, 0)

                // Clear the frame canvas and draw the composite onto it
                frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height)
                frameContext.drawImage(compositeCanvas, 0, 0)

                // Handle disposal methods
                const { frameInfo } = frame
                const { disposal } = frameInfo

                if (disposal === 2) {
                    // Restore to background - clear the area of this frame
                    compositeContext.clearRect(frameInfo.x, frameInfo.y, frameInfo.width, frameInfo.height)
                } else if (disposal === 3) {
                    // Restore to previous - restore from buffer
                    compositeContext.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height)
                    compositeContext.drawImage(bufferCanvas, 0, 0)
                }

                // Add the frame to our texture list
                this.push(PIXI.Texture.from(frameCanvas))
            }
        }
    }
    function _0x1259B(_0x111D7) {
        for (var _0x111EE = _0x111D7.length - 1; _0x111EE > 0; _0x111EE--) {
            var _0x11205 = Math.floor(Math.random() * (_0x111EE + 1))
            var _0x1121C = _0x111D7[_0x111EE]
            _0x111D7[_0x111EE] = _0x111D7[_0x11205]
            _0x111D7[_0x11205] = _0x1121C
        }
        return _0x111D7
    }
    var _0x11B8B = []
    var _0x11BA2 = []
    for (var _0x11BD0 = 0; _0x11BD0 < 180; _0x11BD0++) {
        var _0x115E2 = tinycolor({
            h: _0x11BD0 * 2,
            s: 97.25,
            v: 100
        })
        var _0x115F9 = _0x115E2.toRgb()
        _0x11B8B[_0x11BD0] = (_0x115F9.r << 16) + (_0x115F9.g << 8) + _0x115F9.b
        _0x11BA2[_0x11BD0] = _0x115E2.toHexString()
    }
    const _0x122A4 = _0x1259B(_0x11B8B.slice(0))
    const _0x122BB = _0x1259B(_0x11BA2.slice(0))
    delete _0x11B8B
    delete _0x11BA2
    if (eventSettings.enabled && eventSettings.foodColors) {
        _0x11A49 = function (_0x111D7) {
            return eventSettings.foodColors[_0x111D7 % eventSettings.foodColors.length]
        }
    }
    const _0x114A0 = ["#FFFFFF", "#FF9BDC", "#FF00FF", "#FF0000", "#C80000", "#FF6900", "#FFFF00", "#00FF00", "#008000", "#008080", "#00FFFF", "#0096FF", "#0000FF", "#CA48FA", "#8A2BE2", "#D2C878", "#8C4614"]
    const _0x12739 = {}
    function _0x112D4(_0x111D7) {
        if (_0x111D7 === 0 || _0x111D7 === player1.playerId) {
            return "You cannot block that player."
        }
        if (chatCommands.includes(_0x111D7)) {
            delete chatCommands[_0x111D7]
            return "Unblocked player with ID: " + _0x111D7
        }
        chatCommands.push(_0x111D7)
        return "Blocked player with ID: " + _0x111D7
    }
    const _0x11610 = {
        whisper: {
            description: "Whisper a player by ID",
            triggers: ["whisper", "t", "w"],
            action: function (_0x111D7) {
                if (player1.enabled) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (isNaN(_0x111EE)) {
                        player1.selfMsg("Invalid player id.")
                        return
                    }
                    var _0x11205 = _0x111D7.slice(1).join(" ")
                    if (_0x11205.length != 0) {
                        player1.sendPacket(new network.sendWhisper(_0x111EE, _0x11205))
                    }
                    setChatInputValue("/t " + _0x111EE + " ")
                } else if (player2.enabled) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (isNaN(_0x111EE)) {
                        player2.selfMsg("Invalid player id.")
                        return
                    }
                    var _0x11205 = _0x111D7.slice(1).join(" ")
                    if (_0x11205.length != 0) {
                        player2.sendPacket(new network.sendWhisper(_0x111EE, _0x11205))
                    }
                    setChatInputValue("/t " + _0x111EE + " ")
                }
            }
        },
        reply_whisper: {
            description: "Reply to previous whisper",
            triggers: ["reply", "r"],
            action: function (_0x111D7) {
                if (player1.enabled) {
                    var _0x111EE = _0x111D7.join(" ")
                    if (_0x111EE.length != 0) {
                        player1.sendPacket(new network.sendWhisper(0, _0x111EE))
                    }
                    setChatInputValue("/r ")
                } else if (player2.enabled) {
                    var _0x111EE = _0x111D7.join(" ")
                    if (_0x111EE.length != 0) {
                        player2.sendPacket(new network.sendWhisper(0, _0x111EE))
                    }
                    setChatInputValue("/r ")
                }
            }
        },
        party_chat: {
            description: "Send a message to other party members",
            triggers: ["party", "p"],
            action: function (_0x111D7) {
                if (player1.enabled) {
                    var _0x111EE = _0x111D7.join(" ")
                    if (_0x111EE.length != 0) {
                        player1.sendPacket(new network.sendChat(_0x111EE, 1))
                    }
                    setChatInputValue("/p ")
                } else if (player2.enabled) {
                    var _0x111EE = _0x111D7.join(" ")
                    if (_0x111EE.length != 0) {
                        player2.sendPacket(new network.sendChat(_0x111EE, 1))
                    }
                    setChatInputValue("/p ")
                }
            }
        },
        invite: {
            description: "Invite a player to the party",
            triggers: ["invite", "i"],
            action: function (_0x111D7) {
                if (player1.isPartyLeader()) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (!isNaN(_0x111EE)) {
                        player1.sendPacket(new network.sendPartyAction(0, _0x111EE))
                    } else {
                        player1.selfMsg("Invalid ID.")
                    }
                } else if (player2.isPartyLeader()) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (!isNaN(_0x111EE)) {
                        player2.sendPacket(new network.sendPartyAction(0, _0x111EE))
                    } else {
                        player2.selfMsg("Invalid ID.")
                    }
                }
            }
        },
        leave: {
            description: "Leave your current party",
            triggers: ["leave", "l"],
            action: function (_0x111D7) {
                if (player1.enabled) {
                    player1.sendPacket(new network.sendPartyAction(3, 0))
                } else if (player2.enabled) {
                    player2.sendPacket(new network.sendPartyAction(3, 0))
                }
            }
        },
        promote: {
            description: "Promote a party member to leader",
            triggers: ["promote"],
            action: function (_0x111D7) {
                if (player1.isPartyLeader()) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (!isNaN(_0x111EE)) {
                        player1.sendPacket(new network.sendPartyAction(2, _0x111EE))
                    } else {
                        player1.selfMsg("Invalid ID.")
                    }
                } else if (player2.isPartyLeader()) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (!isNaN(_0x111EE)) {
                        player2.sendPacket(new network.sendPartyAction(2, _0x111EE))
                    } else {
                        player2.selfMsg("Invalid ID.")
                    }
                }
            }
        },
        kick: {
            description: "Kick a player from the party",
            triggers: ["kick"],
            action: function (_0x111D7) {
                if (player1.isPartyLeader()) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (!isNaN(_0x111EE)) {
                        player1.sendPacket(new network.sendPartyAction(1, _0x111EE))
                    } else {
                        player1.selfMsg("Invalid ID.")
                    }
                } else if (player2.isPartyLeader()) {
                    var _0x111EE = parseInt(_0x111D7[0])
                    if (!isNaN(_0x111EE)) {
                        player2.sendPacket(new network.sendPartyAction(1, _0x111EE))
                    } else {
                        player2.selfMsg("Invalid ID.")
                    }
                }
            }
        },
        clear: {
            description: "Clear the chat",
            triggers: ["clear"],
            action: function (_0x111D7) {
                var _0x11205 = document.getElementsByClassName("chat-active-tab")[0].getAttribute("name")
                var _0x111EE = document.getElementById("chat-body-" + _0x11205)
                while (_0x111EE.firstChild != null) {
                    _0x111EE.removeChild(_0x111EE.firstChild)
                }
            }
        },
        info: {
            description: "Get your current ID",
            triggers: ["info"],
            action: function (_0x111D7) {
                if (player1.playerId > 0) {
                    player1.selfMsg("Your id is " + player1.playerId)
                } else {
                    player1.selfMsg("You need to be connected to a server to use this command.")
                }
            }
        },
        scrimmenu: {
            description: "Show the scrimmage menu",
            triggers: ["scrimmenu"],
            action: function (_0x111D7) {
                scrimmageMenu.css("display", scrimmageMenu.css("display") == "none" ? "block" : "none")
            }
        },
        join: {
            description: "Join a party with a code",
            triggers: ["join", "j"],
            action: function (_0x111D7) {
                if (player1.enabled) {
                    var _0x111EE = _0x111D7[0]
                    if (_0x111EE != null && _0x111EE.length != 0) {
                        player1.sendPacket(new network.sendPartyJoin(_0x111EE))
                    }
                } else if (player2.enabled) {
                    var _0x111EE = _0x111D7[0]
                    if (_0x111EE != null && _0x111EE.length != 0) {
                        player2.sendPacket(new network.sendPartyJoin(_0x111EE))
                    }
                }
            }
        },
        private: {
            description: "Set the party to private",
            triggers: ["private"],
            action: function (_0x111D7) {
                if (player1.isPartyLeader()) {
                    player1.sendPacket(new network.sendPartyAction(4, 1))
                } else if (player2.isPartyLeader()) {
                    player2.sendPacket(new network.sendPartyAction(4, 1))
                }
            }
        },
        public: {
            description: "Allow players to join the party without an invite",
            triggers: ["public"],
            action: function (_0x111D7) {
                if (player1.isPartyLeader()) {
                    player1.sendPacket(new network.sendPartyAction(4, 0))
                } else if (player2.isPartyLeader()) {
                    player2.sendPacket(new network.sendPartyAction(4, 0))
                }
            }
        },
        reset_chat: {
            description: "Reset chat size",
            triggers: ["resetchat"],
            action: function (_0x111D7) {
                $("#chat-panel").css("width", "360px")
                $("#chat-panel").css("height", "250px")
            }
        },
        reset_chat_tabs: {
            description: "Reset chat tab settings",
            triggers: ["resetchattabs"],
            action: function (_0x111D7) {
                clientSettings._ChatTabs = JSON.parse(JSON.stringify(defaultChatTabs))
                _0x1135E()
                _0x12317()
            }
        },
        spectate: {
            description: "Spectate a player",
            triggers: ["spectate", "s"],
            action: function (_0x111D7) {
                var _0x111EE = parseInt(_0x111D7[0])
                if (!isNaN(_0x111EE)) {
                    player1.sendPacket(new network.sendSpectate(_0x111EE))
                } else {
                    player1.selfMsg("Invalid ID.")
                }
            }
        },
        disconnect: {
            description: "Disconnect from the server",
            triggers: ["disconnect"],
            action: function (_0x111D7) {
                player1.disconnect()
                player2.disconnect()
            }
        },
        account: {
            description: "Get Account UID",
            triggers: ["account"],
            action: function (_0x111D7) {
                if (globalUserData === null) {
                    player1.selfMsg("You are not logged in.")
                    return
                }
                player1.selfMsg("UID: " + globalUserData.uid)
            }
        },
        block: {
            description: "Block or unblock a player by ID",
            triggers: ["block", "b"],
            action: function (_0x111D7) {
                var _0x11205 = parseInt(_0x111D7[0])
                if (!isNaN(_0x11205)) {
                    var _0x111EE = _0x112D4(_0x11205)
                    player1.selfMsg(_0x111EE)
                }
            }
        }
    }
    const emotiesNames = ["4Head", "BibleThump", "DansGame", "DatSheffy", "FailFish", "FeelsBadMan", "FeelsGoodMan", "FeelsMadMan", "GabeN", "HassanChop", "HeyGuys", "Kappa", "KappaPride", "Keepo", "Kreygasm", "NotLikeThis", "OMGScoots", "PJSalt", "PogChamp", "rekt", "rip", "SaltyCorn", "sodaC", "sodaHeyGuys", "sodaNOPE", "sodaW", "SwiftRage", "WutFace", "ResidentSleeper", "LUL", "MikuFail", "PepoHype", "KKona", "MeguFace", "AngryBork", "AngeryBOYE", "TohruFlex", "Sadness", "nou", "MarioFP"]
    const _0x11A8E = ["Ditto", "MichaelPls", "RareParrot", "PepePls", "RooNoticeMe", "PepeEyes", "EverythingsFine", "WeSmart", "PandaAww", "SleepyCat", "Clap"]
    // Hexadecimal digits array used for color conversions
    var hexDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
    const keyNames = [
        "", // 0
        "LMB", // 1 MOUSE1
        "MMB", // 2 MOUSE2
        "RMB", // 3 MOUSE3
        "Mouse 4", // 4 MOUSE4
        "Mouse 5", // 5 MOUSE5
        "Help", // 6 HELP (Rarely used directly, Insert often doubles)
        "", // 7
        "Backspace", // 8 BACK_SPACE
        "Tab", // 9 TAB
        "", // 10
        "", // 11
        "Clear", // 12 CLEAR (Often Num 5 with Num Lock off)
        "Enter", // 13 ENTER
        "Enter", // 14 ENTER_SPECIAL (Usually main Enter too)
        "", // 15
        "Shift", // 16 SHIFT (Generic, no Left/Right distinction in input)
        "Ctrl", // 17 CONTROL
        "Alt", // 18 ALT
        "Pause", // 19 PAUSE
        "Caps Lock", // 20 CAPS_LOCK
        "", // 21 KANA (IME)
        "", // 22 EISU (IME)
        "", // 23 JUNJA (IME)
        "", // 24 FINAL (IME)
        "", // 25 HANJA (IME)
        "", // 26
        "Escape", // 27 ESCAPE
        "", // 28 CONVERT (IME)
        "", // 29 NONCONVERT (IME)
        "", // 30 ACCEPT (IME)
        "", // 31 MODECHANGE (IME)
        "Space", // 32 SPACE
        "Page Up", // 33 PAGE_UP
        "Page Down", // 34 PAGE_DOWN
        "End", // 35 END
        "Home", // 36 HOME
        "Arrow Left", // 37 LEFT
        "Arrow Up", // 38 UP
        "Arrow Right", // 39 RIGHT
        "Arrow Down", // 40 DOWN
        "Select", // 41 SELECT (Rare)
        "Print", // 42 PRINT (Rare)
        "Execute", // 43 EXECUTE (Rare)
        "Print Screen", // 44 PRINTSCREEN
        "Insert", // 45 INSERT
        "Delete", // 46 DELETE
        "Help", // 47
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        ":", // 58 (Often Shift+;)
        ";", // 59
        "<", // 60 (Often Shift+,)
        "=", // 61
        ">", // 62 (Often Shift+.)
        "?", // 63 (Often Shift+/)
        "@", // 64 (Often Shift+2)
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M", // 65-77
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z", // 78-90
        "Meta", // 91 OS_KEY (Win/Cmd)
        "Meta", // 92
        "Menu", // 93 CONTEXT_MENU
        "", // 94
        "Sleep", // 95 SLEEP
        "Num 0",
        "Num 1",
        "Num 2",
        "Num 3",
        "Num 4", // 96-100 NUMPAD0-4
        "Num 5",
        "Num 6",
        "Num 7",
        "Num 8",
        "Num 9", // 101-105 NUMPAD5-9
        "Num *", // 106 MULTIPLY
        "Num +", // 107 ADD
        "Num Enter", // 108 SEPARATOR (Usually Numpad Enter)
        "Num -", // 109 SUBTRACT
        "Num .", // 110 DECIMAL
        "Num /", // 111 DIVIDE
        "F1",
        "F2",
        "F3",
        "F4",
        "F5",
        "F6",
        "F7",
        "F8",
        "F9", // 112-120
        "F10",
        "F11",
        "F12", // 121-123
        "F13",
        "F14",
        "F15",
        "F16",
        "F17",
        "F18",
        "F19", // 124-130
        "F20",
        "F21",
        "F22",
        "F23",
        "F24", // 131-135
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "", // 136-143
        "Num Lock", // 144 NUM_LOCK
        "Scroll Lock", // 145 SCROLL_LOCK
        "",
        "",
        "",
        "",
        "", // 146-150 (OEM Specific)
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "", // 151-159
        "^", // 160 CIRCUMFLEX (Often Shift+6)
        "!", // 161 EXCLAMATION (Often Shift+1)
        '"', // 162 DOUBLE_QUOTE (Often Shift+')
        "#", // 163 HASH (Often Shift+3)
        "$", // 164 DOLLAR (Often Shift+4)
        "%", // 165 PERCENT (Often Shift+5)
        "&", // 166 AMPERSAND (Often Shift+7)
        "_", // 167 UNDERSCORE (Often Shift+-)
        "(", // 168 OPEN_PAREN (Often Shift+9)
        ")", // 169 CLOSE_PAREN (Often Shift+0)
        "*", // 170 ASTERISK (Often Shift+8)
        "+", // 171 PLUS (Often Shift+=)
        "|", // 172 PIPE (Often Shift+\)
        "-", // 173 HYPHEN_MINUS
        "{", // 174 OPEN_CURLY_BRACKET (Often Shift+[)
        "}", // 175 CLOSE_CURLY_BRACKET (Often Shift+])
        "~", // 176 TILDE (Often Shift+`)
        "",
        "",
        "",
        "", // 177-180
        "Mute", // 181 VOLUME_MUTE
        "Vol Down", // 182 VOLUME_DOWN
        "Vol Up", // 183 VOLUME_UP
        "",
        "", // 184-185
        ";", // 186 SEMICOLON
        "=", // 187 EQUALS
        ",", // 188 COMMA
        "-", // 189 MINUS
        ".", // 190 PERIOD
        "/", // 191 SLASH
        "`", // 192 BACK_QUOTE
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "", // 193-208
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "", // 209-224
        "[", // 219 OPEN_BRACKET
        "\\", // 220 BACK_SLASH
        "]", // 221 CLOSE_BRACKET
        "'", // 222 QUOTE
        "", // 223
        "Meta", // 224 META (Can be OS key or other)
        "AltGr", // 225 ALTGR
        "", // 226
        "", // 227 WIN_ICO_HELP
        "", // 228 WIN_ICO_00
        "", // 229
        "", // 230 WIN_ICO_CLEAR
        "",
        "", // 231-232
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "", // 233-245 (OEM Specific)
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "", // 246-254
        "" // 255
    ]
    var ejectMassSkins = ["heart", "star", "home", "apple", "spiral", "dice", "chicken", "ghost", "burger", "bow", "cloud", "skull", "mug", "flower", "music", "checkmark", "clover", "crown", "fancy", "fish", "fire", "lightning", "paw", "duck", "snowflake", "bomb", "butterfly", "cherry", "watermelon", "cat", "cupid", "sword", "shield", "tornado", "radioactive", "rocket", "wave", "letter_a", "letter_b", "letter_c", "letter_d", "letter_e", "letter_f", "letter_g", "letter_h", "letter_i", "letter_j", "letter_k", "letter_l", "letter_m", "letter_n", "letter_o", "letter_p", "letter_q", "letter_r", "letter_s", "letter_t", "letter_u", "letter_v", "letter_w", "letter_x", "letter_y", "letter_z", "number_0", "number_1", "number_2", "number_3", "number_4", "number_5", "number_6", "number_7", "number_8", "number_9"]
    var array = []
    var _0x118AB = null
    const colorValues = [16708096, 13294378, 9356863, 3847498, 42578, 42612, 108702, 43973, 44527, 36821, 29371, 21669, 3027346, 6696593, 9578383, 12393101, 15532172, 15468916, 15537243, 15538497, 15538980, 15951139, 16225309, 16761359]
    const colorArrayLength = colorValues.length * 100 - 1
    /**
     * Converts a byte value to a two-character hexadecimal string
     * @param {number} byteValue - The byte value to convert (0-255)
     * @returns {string} The hexadecimal representation of the byte
     */
    function byteToHex(byteValue) {
        return hexDigits[(byteValue >> 4) & 0xf] + hexDigits[byteValue & 0xf]
    }

    function formatAliveTime(_0x1121C) {
        if (_0x1121C <= 0) {
            return "0:00"
        }
        var _0x111D7 = Math.floor(_0x1121C / 3600)
        var _0x111EE = Math.floor((_0x1121C - _0x111D7 * 3600) / 60)
        var _0x11205 = _0x1121C - _0x111D7 * 3600 - _0x111EE * 60
        if (_0x111EE < 10 && _0x111D7 > 0) {
            _0x111EE = "0" + _0x111EE
        }
        if (_0x11205 < 10) {
            _0x11205 = "0" + _0x11205
        }
        return (_0x111D7 > 0 ? _0x111D7 + ":" : "") + _0x111EE + ":" + _0x11205
    }
    function formatExperience(_0x111EE) {
        var _0x111D7 = _0x111EE.toString().split(".")
        _0x111D7[0] = _0x111D7[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return _0x111D7.join(".")
    }
    function _0x11FAD(_0x1121C) {
        var _0x111EE = _0x1121C.split("")
        for (var _0x11205 = 0; _0x11205 < _0x111EE.length; _0x11205++) {
            var _0x111D7 = _0x111EE[_0x11205]
            if (_0x111D7 == "_") {
                if (_0x11205 + 1 < _0x111EE.length) {
                    _0x111EE[_0x11205 + 1] = _0x111EE[_0x11205 + 1].toUpperCase()
                }
                _0x111EE[_0x11205] = " "
            }
            if (_0x11205 == 0) {
                _0x111EE[_0x11205] = _0x111EE[_0x11205].toUpperCase()
            }
        }
        return _0x111EE.join("")
    }
    /**
     * Get a contrasting color (black or white) for text based on background color
     * @param {string} hexColor - Hex color code with or without # prefix
     * @returns {string} - Either "#000000" (black) or "#FFFFFF" (white) depending on contrast
     */
    function getContrastColor(hexColor) {
        if (hexColor.indexOf("#") === 0) {
            hexColor = hexColor.slice(1)
        }

        if (hexColor.length === 3) {
            // Convert 3-digit hex to 6-digit hex
            hexColor = hexColor[0] + hexColor[0] + hexColor[1] + hexColor[1] + hexColor[2] + hexColor[2]
        }

        if (hexColor.length !== 6) {
            return "#000000"
        }

        // Parse RGB components
        var red = parseInt(hexColor.slice(0, 2), 16)
        var green = parseInt(hexColor.slice(2, 4), 16)
        var blue = parseInt(hexColor.slice(4, 6), 16)

        // Calculate perceived brightness using the formula
        // (0.299*R + 0.587*G + 0.114*B)
        var brightness = red * 0.299 + green * 0.587 + blue * 0.114

        // Return black for bright colors, white for dark colors
        return brightness > 186 ? "#000000" : "#FFFFFF"
    }
    function _0x119ED(_0x111D7) {
        if (_0x111D7.dataTransfer.items) {
            for (var _0x11205 = 0; _0x11205 < _0x111D7.dataTransfer.items.length; _0x11205++) {
                if (_0x111D7.dataTransfer.items[_0x11205].kind === "file") {
                    var _0x111EE = _0x111D7.dataTransfer.items[_0x11205].getAsFile()
                    return _0x111EE
                }
            }
        } else {
            for (var _0x11205 = 0; _0x11205 < _0x111D7.dataTransfer.files.length; _0x11205++) {
                return _0x111D7.dataTransfer.files[_0x11205]
            }
        }
    }
    function _0x117DC(_0x1121C, _0x111EE, _0x11233) {
        var _0x11205 = new Blob([_0x111EE], {
            type: _0x11233
        })
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(_0x11205, _0x1121C)
        } else {
            var _0x111D7 = document.createElement("a"),
                _0x1124A = URL.createObjectURL(_0x11205)
            _0x111D7.href = _0x1124A
            _0x111D7.download = _0x1121C
            document.body.appendChild(_0x111D7)
            _0x111D7.click()
            setTimeout(function () {
                document.body.removeChild(_0x111D7)
                window.URL.revokeObjectURL(_0x1124A)
            }, 0)
        }
    }
    const CellVisibility = {
        ALL: 3,
        PARTY: 2,
        SELF: 1,
        NONE: 0
    }
    const MassDisplayType = {
        DEFAULT: 0,
        SHORT: 1
    }
    const NameOutlineThickness = {
        THICK: 10,
        MEDIUM: 6.5,
        SLIM: 3,
        NONE: 0
    }
    const _0x11ABC = {
        ULTRA: 1,
        HIGH: 0.8,
        MEDIUM: 0.7,
        LOW: 0.5,
        VERYLOW: 0.25
    }
    const CustomGameUpdateType = {
        MAP: 0,
        MODE: 1,
        SIZE: 2,
        STARTMASS: 3,
        LOCK: 4,
        PLAYER_UPDATE: 5,
        PLAYER_LIST: 6,
        VIRUS_DENSITY: 7,
        PUBLIC: 8,
        PASSWORD: 9,
        NAME: 10,
        RESPAWN_DELAY: 11,
        AUTOSPLIT: 12
    }
    const Team = {
        0: "Spectator",
        1: "Blue",
        2: "Red",
        3: "Green",
        4: "Yellow",
        5: "Purple",
        6: "Orange",
        7: "Pink",
        8: "Brown"
    }
    const AuthenticatedResponse = {
        FAILURE: 1,
        SUCCESS: 0
    }
    const SKIN_LOAD_STATUS = {
        ERROR: -1,
        NOT_LOADED: 0,
        LOADING: 1,
        LOADED: 2
    }
    // Renamed from _0x1260E
    const ChatTabFlags = {
        ALL: 1,
        PARTY: 2,
        WHISPER: 4,
        SYSTEM: 8,
        ADMIN: 16
    }
    const PlayerState = {
        UNKNOWN: -1,
        ALIVE: 0,
        DEAD: 1,
        SPECTATE: 2
    }
    var teamColors = ["white", "#25f", "#f31", "green", "yellow", "purple", "orange"]
    function createFontConfig(font, size, outlineColor = "#000") {
        this.font = font
        this.size = size
        this.outlineColor = outlineColor
    }
    const defaultFontConfigurations = {
        0: new createFontConfig("Verdana", 54),
        1: new createFontConfig("ampad", 75),
        2: new createFontConfig("burnstown", 81),
        3: new createFontConfig("chlorinar", 75),
        4: new createFontConfig("Facon", 75),
        5: new createFontConfig("archistico", 75),
        6: new createFontConfig("breakaway", 81),
        7: new createFontConfig("conformity", 81),
        8: new createFontConfig("electroharmonix", 70),
        9: new createFontConfig("PWJoyeuxNoel", 70),
        10: new createFontConfig("leckerli-one", 75),
        101: new createFontConfig("IceCaps", 81, "#00c9ff"),
        102: new createFontConfig("BrazierFlame", 81, "#e25822")
    }
    const _0x11780 = defaultFontConfigurations[0]
    function _0x11A04(_0x111C0) {
        return _0x111C0 > 0 && defaultFontConfigurations[_0x111C0] ? defaultFontConfigurations[_0x111C0] : _0x11780
    }
    for (var _0x11BE7 in defaultFontConfigurations) {
        var _0x118D9 = defaultFontConfigurations[_0x11BE7]
        var _0x11FC4 = new FontFaceObserver(_0x118D9.font)
        _0x11FC4.load(null, 1e4).then(
            () => { },
            () => { }
        )
        if (_0x11BE7 > 0 && _0x11BE7 < 64) {
            $("#spNameFont").append('<option value="' + _0x11BE7 + '" style="font-family:' + _0x118D9.font + '">' + _0x118D9.font.charAt(0).toUpperCase() + _0x118D9.font.slice(1) + "</option>")
        }
    }
    function _0x127C3() {
        if (!_0x1163E.consented) {
            return
        }
        var _0x111EE = localStorage.getItem("version")
        var _0x111D7 = version.split(".")
        if (_0x111EE === null) {
            localStorage.setItem("version", version)
            return
        }
        _0x111EE = _0x111EE.split(".")
        if (_0x111D7[0] != _0x111EE[0] || _0x111D7[1] != _0x111EE[1]) {
            localStorage.setItem("version", version)
            hideUIElement(mainUI)
            showUIElement($("#popup-changelog"))
        }
    }
    $(window).focus(function () {
        _0x11C43 = true
    })
    $(window).blur(function () {
        _0x11C43 = false
    })
    function _0x124B5() {
        if (_0x11C43) {
            return
        }
        if (!("Notification" in window)) {
            return
        }
        if (Notification.permission === "granted") {
            var _0x111D7 = new Notification("Your match has started.", {
                icon: "https://gota.io/assets/images/favicon.png"
            })
        }
    }
    var _0x1163E = new _0x11655()

    function _0x11655() {
        this.consented = false
        this.policyID = "CP_0918_01"
        this.policyLink = "https://gota.io/policies/privacy.html?v=" + this.policyID + "#cookies"
        this.consentOption = $("#cc_acceptCookies")
        this.consentCookie = {
            name: "cookieConsent",
            value: "yes+" + this.policyID,
            exdays: 730,
            path: "/web"
        }
        this.cookieBanner = {
            banner: $("#cookie-banner"),
            decline: $("#declineCookies"),
            accept: $("#acceptCookies"),
            handlersBound: false
        }
        this.init = function () {
            this.backwardsCompatable()
            this.consentOption.on("change", function (_0x111D7) {
                _0x1163E.consentHandler($(this).prop("checked"))
            })
            var _0x111D7 = this.getConsentCookie()
            if (_0x111D7 === this.consentCookie.value) {
                this.consentHandler(true)
                this.showCookieBanner(false)
            } else {
                this.consentHandler(false)
                this.showCookieBanner(true)
            }
        }
        this.consentHandler = function (_0x111D7) {
            this.consented = _0x111D7
            aiptag.consented = _0x111D7
            this.consentOption.prop("checked", _0x111D7)
            if (!_0x111D7) {
                this.deleteConsentCookie()
                if (fb_app1.auth().currentUser !== null) {
                    fb_app1
                        .auth()
                        .signOut()
                        .then(function () { })
                        .catch((_0x111C0) => { })
                }
                if (fb_app2.auth().currentUser !== null) {
                    fb_app2
                        .auth()
                        .signOut()
                        .then(function () { })
                        .catch((_0x111C0) => { })
                }
                $("#authed").hide()
                $("#account-loader").hide()
                $("#guest").hide()
                $("#no_cookie_consent").show()
                $("#authed2").hide()
                $("#account2-loader").hide()
                $("#guest2").hide()
                $("#no_cookie_consent2").show()
                this.showCookieBanner(true)
            } else {
                this.createConsentCookie()
                this.showCookieBanner(false)
                _0x11DB3()
                //$("#animationDelay").val(clientSettings.rAnimationDelay);
                $("#animationDelay").val(clientSettings.rAnimationDelay)
                $("#camDelay").val(clientSettings.rCamDelay)
                $("#viewDistance").val(clientSettings.rViewDistance)
                $("#reconnectPeriod").val(clientSettings.rReconnectPeriod)
                $("#uiScale").val(Number.parseFloat(clientSettings.rUiScale * 100).toFixed(0))
                _0x11E54()
                $("#no_cookie_consent").hide()
                $("#no_cookie_consent2").hide()
                if ($("#account2-loader").css("display") !== "none") {
                    $("#guest2").hide()
                } else {
                    $("#guest2").show()
                }
                if ($("#account-loader").css("display") !== "none") {
                    $("#guest").hide()
                } else {
                    $("#guest").show()
                }
            }
        }
        this.showCookieBanner = function (_0x111D7) {
            if (_0x111D7) {
                if (!this.cookieBanner.handlersBound) {
                    this.bindBannerHandlers()
                    this.cookieBanner.handlersBound = true
                }
                this.cookieBanner.banner.slideDown()
            } else {
                this.cookieBanner.banner.slideUp()
            }
        }
        this.bindBannerHandlers = function () {
            this.cookieBanner.decline.on("click", function (_0x111D7) {
                _0x1163E.consentHandler(false)
                _0x1163E.showCookieBanner(false)
            })
            this.cookieBanner.accept.on("click", function (_0x111D7) {
                _0x1163E.consentHandler(true)
                _0x1163E.showCookieBanner(false)
            })
            $("#cookie-banner .description").append(' <a href="' + this.policyLink + '" target="_blank">Our Cookie Policy!</a>')
        }
        this.createConsentCookie = function () {
            var _0x111D7 = new Date()
            _0x111D7.setTime(_0x111D7.getTime() + this.consentCookie.exdays * 24 * 60 * 60 * 1e3)
            var _0x111EE = "expires=" + _0x111D7.toUTCString()
            document.cookie = this.consentCookie.name + "=" + this.consentCookie.value + ";" + _0x111EE + ";path=" + this.consentCookie.path + ";"
        }
        this.deleteConsentCookie = function () {
            document.cookie = this.consentCookie.name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=" + this.consentCookie.path + ";"
        }
        this.getConsentCookie = function () {
            var _0x11233 = this.consentCookie.name + "="
            var _0x11205 = decodeURIComponent(document.cookie)
            var _0x111EE = _0x11205.split(";")
            for (var _0x1121C = 0; _0x1121C < _0x111EE.length; _0x1121C++) {
                var _0x111D7 = _0x111EE[_0x1121C]
                while (_0x111D7.charAt(0) == " ") {
                    _0x111D7 = _0x111D7.substring(1)
                }
                if (_0x111D7.indexOf(_0x11233) == 0) {
                    return _0x111D7.substring(_0x11233.length, _0x111D7.length)
                }
            }
            return false
        }
        this.backwardsCompatable = function () {
            var _0x11233 = "cookieconsent_status="
            var _0x11205 = decodeURIComponent(document.cookie)
            var _0x111EE = _0x11205.split(";")
            var _0x1124A = null
            for (var _0x1121C = 0; _0x1121C < _0x111EE.length; _0x1121C++) {
                var _0x111D7 = _0x111EE[_0x1121C]
                while (_0x111D7.charAt(0) == " ") {
                    _0x111D7 = _0x111D7.substring(1)
                }
                if (_0x111D7.indexOf(_0x11233) == 0) {
                    _0x1124A = _0x111D7.substring(_0x11233.length, _0x111D7.length)
                }
            }
            if (_0x1124A === "allow") {
                this.createConsentCookie()
                document.cookie = "cookieconsent_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/web;"
            } else {
                document.cookie = "cookieconsent_status=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/web;"
            }
        }
    }
    var _0x12698 = new _0x126AF()

    // --- End Hash Calculation ---

    function _0x126AF() {
        this.playCounter = 0
        this.incrementPlay = function () {
            if (isAccountLocked) {
                return false
            }
            this.playCounter++
            if (this.playCounter % 5 == 1) {
                return true
            } else {
                return false
            }
        }
    }
    // function initializeAdPlayer() {
    //     if (typeof aipPlayer != "undefined") {
    //         aiptag.cmd.player.push(function () {
    //             adplayer = new aipPlayer({
    //                 AD_WIDTH: 960,
    //                 AD_HEIGHT: 540,
    //                 AD_CENTERPLAYER: false,
    //                 LOADING_TEXT: "Advertisement Loading...",
    //                 PREROLL_ELEM: document.getElementById("preroll"),
    //                 AIP_COMPLETE: function () {
    //                     if (!player1.spectate) {
    //                         player1.play()
    //                     } else {
    //                         player1.spec()
    //                     }
    //                 }
    //             })
    //         })
    //     } else {
    //     }
    // }

    // initializeAdPlayer()
    initializeUIElements()
}

showSideMenu = show_side_menu
hideSideMenu = hide_side_menu

version = "3.6.5"

// check if PIXI loaded before initializing the game
const checkPixiInterval = setInterval(() => {
    if (typeof PIXI !== "undefined") {
        clearInterval(checkPixiInterval);
        init_game();
    }
}, 100);

// Notification System
const notificationQueue = []
let isShowingNotification = false
const processedMessages = new Set()
// Track messages we've already seen

// Keywords that should skip notification
const SKIP_KEYWORDS = ["store", "visit", "connecting", "connect", "server", "Server", "Connect"]

function processQueue() {
    if (notificationQueue.length === 0 || isShowingNotification) return

    isShowingNotification = true
    const { message } = notificationQueue.shift()

    showNotification(message)
}

function showNotification(message) {
    const container = document.getElementById("notification-container")

    const notification = document.createElement("div")
    notification.className = "notification"

    const closeButton = document.createElement("span")
    closeButton.className = "notification-close"
    closeButton.innerHTML = "×"
    closeButton.onclick = function () {
        notification.remove()
        isShowingNotification = false
        processQueue()
    }

    notification.innerHTML = message
    notification.appendChild(closeButton)
    container.appendChild(notification)

    setTimeout(() => {
        notification.remove()
        isShowingNotification = false
        processQueue()
    }, 2500)
}

function getCleanMessage(text) {
    return text.replace(/\[System\]/i, "").trim()
}

function shouldSkipNotification(text) {
    const lowerText = text.toLowerCase()
    return SKIP_KEYWORDS.some((keyword) => lowerText.includes(keyword.toLowerCase()))
}

function handleSystemMessage(element) {
    const text = element.textContent || element.innerText
    if (!text.match(/\[System\]/i)) return

    if (shouldSkipNotification(text)) return

    const message = getCleanMessage(text)

    // Skip if we've already processed this exact message
    if (processedMessages.has(message)) return

    processedMessages.add(message)
    notificationQueue.push({
        message
    })
    processQueue()
}

function scanExistingMessages() {
    const chatBody = document.getElementById("chat-body-0")
    if (!chatBody) return

    const spans = chatBody.getElementsByTagName("span")
    for (let span of spans) {
        handleSystemMessage(span)
    }
}

const chatObserver = new MutationObserver(function (mutations) {
    for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
            if (node.nodeType === 1) {
                // Element node
                // Check all spans in the added node
                const spans = node.getElementsByTagName ? node.getElementsByTagName("span") : []
                for (let span of spans) {
                    handleSystemMessage(span)
                }

                // If the node itself is a span, check it too
                if (node.tagName === "SPAN") {
                    handleSystemMessage(node)
                }
            }
        }
    }
})

window.onload = function () {
    if (!document.getElementById("notification-container")) {
        const container = document.createElement("div")
        container.id = "notification-container"
        container.className = "notification-container"
        document.body.appendChild(container)
    }

    // Initial scan
    setTimeout(scanExistingMessages, 100)

    const chatBody = document.getElementById("chat-body-0")
    if (chatBody) {
        chatObserver.observe(chatBody, {
            childList: true,
            subtree: true,
            characterData: true
        })
    }
}

// Removed the periodic scan to prevent duplicate notifications
// Chat Copy

function copyMessageText(event) {
    const messageRow = event.target.closest("td[data-msgid]")
    if (!messageRow) return

    const contentSpan = messageRow.querySelector("span.chat-content")
    if (!contentSpan) return

    const textToCopy = contentSpan.textContent.trim()

    if (navigator.clipboard) {
        navigator.clipboard
            .writeText(textToCopy)
            .then(() => showFeedback(contentSpan))
            .catch((err) => console.error("Copy failed:", err))
    } else {
        const textarea = document.createElement("textarea")
        textarea.value = textToCopy
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        showFeedback(contentSpan)
    }
}

function showFeedback(element) {
    const oldFeedback = element.querySelector(".copy-feedback")
    if (oldFeedback) oldFeedback.remove()

    const feedback = document.createElement("span")
    feedback.className = "copy-feedback"
    feedback.textContent = " ✓"
    feedback.style.color = "#0f0"
    feedback.style.marginLeft = "5px"
    element.appendChild(feedback)

    setTimeout(() => feedback.remove(), 1000)
}

function initChatCopy() {
    const chatBody = document.getElementById("chat-body-0")
    if (!chatBody) {
        setTimeout(initChatCopy, 1000)
        return
    }

    chatBody.style.cursor = "pointer"

    chatBody.addEventListener("click", function (event) {
        if (event.target.closest("td[data-msgid]")) {
            event.preventDefault()
            event.stopPropagation()
            copyMessageText(event)
        }
    })

    const messageSpans = document.querySelectorAll("span.chat-content")
    messageSpans.forEach((span) => {
        span.style.cursor = "pointer"
    })
}

setTimeout(initChatCopy, 500)
