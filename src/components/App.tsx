import type { ReactNode } from "react";
import React, { Component } from "react";
import { saveAs } from "file-saver";
import type { Config } from "../lib/lss";
import { createSplitsXml } from "../lib/lss";
import logo from "../asset/image/logo.png";
import ArrowButton from "./ArrowButton";
import SplitConfigEditor from "./SplitConfigEditor";
import SplitOutputEditor from "./SplitOutputEditor";

const sampleConfig = {
    "splitIds": [
        "KingsPass",
        "VengefulSpirit",
        "Greenpath",
        "MothwingCloak",
        "Aluba"
    ],
    "ordered": true,
    "endTriggeringAutosplit": true,
    "gameName": "Hollow Knight Category Extensions",
    "categoryName": "Aluba%",
    "variables": {
        "platform": "PC",
        "patch": "1.4.3.2",
        "glitch": "Current Patch NMG",
    },
};

type AppProps = Record<string, never>;
interface AppState {
    configInput: string;
    splitOutput: string;
}
const defaultValue = JSON.stringify(sampleConfig, null, 4);
export default class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            configInput: defaultValue,
            splitOutput: "",
        };
    }
    public render(): ReactNode {
        return (
            <div className="app">
                <h1>
                    <img
                        id="logo"
                        src={logo}
                        alt="HK Split Maker logo"
                    ></img>
                </h1>
                <h2>Instructions</h2>
                <ol>
                    <li>
                        Find the splits you want to use from the <a
                            href="https://github.com/slaurent22/hk-split-maker/blob/main/src/asset/splits.txt"
                            target="_blank"
                        >splits.txt</a> file. For example, if you want to split
                        on "Mask Fragment 4 (Upgrade)", then use "Mask1" as the
                        split name.
                    </li>
                    <li>
                        List your desired splits in the "splitIds" section of
                        the configuration.
                    </li>
                    <li>
                        Change the other configuration values as you see fit.
                        But don't worry; these are easily changeable from
                        LiveSplit later if needed!
                    </li>
                    <li>
                        Click "Submit". The button will temporarily disable
                        while in progress.
                    </li>
                    <li>
                        Click "Download", and save the file to your computer.
                        Open this file in LiveSplit via right click ➡ Open
                        Splits ➡ From File
                    </li>
                </ol>
                <div id="main">
                    <div id="left" className="side">
                        <h2>Input config JSON</h2>
                        <div className="output-container">
                            <ArrowButton
                                text="Submit"
                                id="submit-button"
                                onClick={this.onSubmit.bind(this)}
                            />
                            <SplitConfigEditor
                                defaultValue={defaultValue}
                                onChange={this.onConfigInputChange.bind(this)}
                            />
                            <br></br>
                        </div>
                    </div>
                    <div id="right" className="side">
                        <h2>Output Splits File</h2>
                        <div className="output-container">
                            <ArrowButton
                                id="download-button"
                                text="Download"
                                onClick={this.onDownload.bind(this)}
                            />
                            <SplitOutputEditor
                                defaultValue={this.state.splitOutput}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private onConfigInputChange(value: string|undefined) {
        this.setState({
            configInput: value ?? "",
        });
    }

    private parseConfigInput() {
        return JSON.parse(this.state.configInput) as Config;
    }

    private async onSubmit(): Promise<void> {
        let configObject;
        try {
            configObject = this.parseConfigInput();
        }
        catch {
            alert("Failed to parse config as JSON");
            return;
        }
        console.log(configObject);
        let output = "";

        const submitButton = document.getElementById("submit-button") as HTMLInputElement;
        submitButton.disabled = true;

        try {
            // todo: runtime schema validation
            output = await createSplitsXml(configObject);
        }
        catch (e) {
            console.error(e);
            alert("Failed to create splits. The error has been logged to console.error");
            return;
        }
        finally {
            submitButton.disabled = false;
        }

        this.setState({
            splitOutput: output,
        });
    }

    private onDownload(): void {
        const output = this.state.splitOutput;
        const outBlob = new Blob([output]);

        // Guess a good file name.
        // Can be inaccurate if a new config has been entered but not processed yet.
        let splitName = "";
        let configObject;
        try {
            configObject = this.parseConfigInput();
            splitName = configObject?.categoryName || "splits";
            // Make file name compatible:
            splitName = splitName
                .toLowerCase()
                .replace(/[^a-z0-9]/gi, "_")  // replace non-alphanum with _
                .replace(/^_+|_+$/g, "")  // remove outer _
                .replace(/^_+|_+$/g, "")  // remove outer _
                .replace(/_{2,}/g, "_");  // join multiple _
        }
        catch {
            splitName = "splits";
        }
        saveAs(outBlob, `${splitName}.lss`);
    }
}
