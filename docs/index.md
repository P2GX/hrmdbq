# Human Regulatory Mutation Database Curation Tool (HRMDBQ)

**HRMDBQ** is an Tauri/Angular desktop application specifically designed to streamline the annotation of non-coding Mendelian regulatory variants.

Predicting the consequences of mutations and distinguishing deleterious from neutral mutations in coding sequences are relatively straightforward thanks to the genetic code. The goal of the HRMD project is to comprehensively curate the medical literature for Mendelian disease-causing **non-coding variants** as a foundation for analysis and classification tools.

---

# Installation

HRMDBQ is available as prepackaged installers for macOS, Windows, and Linux. 

!!! abstract "Latest Release"
    Always download the most recent version from the [GitHub Releases](https://github.com/P2GX/hrmdbq/releases) page.

=== "macOS"

    ## Installing on macOS

    > **File to download:** `hrmdbq_<version>_aarch64.dmg`  
    > This is the macOS installer for Apple Silicon (M1/M2/M3/M4 Macs)

    1. Download the `.dmg` file from the [Releases](https://github.com/p2gx/phenoboard/releases) page
    2. Open the DMG and drag the app into your Applications folder
    3. When you try to open it, macOS will show the message:  
    *"'hrmdbq' is an app downloaded from the Internet. Are you sure you want to open it?"*
    
    If you confirm, the app will be installed into your `Applications` folder and started. From now one you can open hrmdbq like any other application (e.g., using the Spotlight searchbar).

=== "Windows"

    ### Installing on Windows
    
    **File to download:** `hrmdbq_<version>_x64_en-US.msi`  
    *(Standard Windows MSI)*

    1. **Download:** Get the `.msi` installer from the [Releases](https://github.com/p2gx/hrmdbq/releases) page.
    2. **Run:** Double-click to start the installer.
    3. **SmartScreen:** If Windows shows a blue dialog saying *"Windows protected your PC"*:
        * Click **"More info"**.
        * Click **"Run anyway"**.

    !!! info "Note"
        Windows shows this for unsigned apps from new developers. Once you install and run it, the warning will not reappear.

=== "Linux"

    ### Installing on Linux (Debian/Ubuntu)

    **File to download:** `hrmdbq_<version>_amd64.deb`  
    *(Recommended for Ubuntu/Debian flavors)*

    1. **Download:** Get the `.deb` package from the [Releases](https://github.com/p2gx/hrmdbq/releases) page.
    2. **Install:** Run one of the following commands in your terminal:

    ```bash title="Using apt (Recommended)"
    sudo apt install ./hrmdbq_<version>_amd64.deb
    ```

    ```bash title="Using dpkg"
    sudo dpkg -i hrmdbq_<version>_amd64.deb
    ```
