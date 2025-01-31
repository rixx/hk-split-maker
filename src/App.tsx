import type { FormEvent, ReactNode } from "react";
import React, { Component } from "react";
import { saveAs } from "file-saver";
import type { Config } from "./lss";
import { createSplitsXml } from "./lss";

const TEXTAREA_ROWS = 22;
const TEXTAREA_COLS = 80;

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


export default class App extends Component {
    public render(): ReactNode {
        return (
            <div className="App">
                <h1>Hollow Knight Split Maker</h1>
                <form onSubmit={this.onSubmit.bind(this)}>
                    <h2>Input config JSON</h2>
                    <textarea
                        id="split-config-input"
                        rows={TEXTAREA_ROWS}
                        cols={TEXTAREA_COLS}
                        defaultValue={JSON.stringify(sampleConfig, null, 4)}
                    ></textarea>
                    <br></br>
                    <input id="submit-button" type="submit" value="Submit"/>
                </form>
                <h2>Output Splits File</h2>
                <div style={({
                    display: "table-caption",
                })}>
                    <button
                        id="download-button"
                        onClick={this.onDownload.bind(this)}
                    >💾 Download</button>
                    <textarea
                        id="split-result"
                        rows={TEXTAREA_ROWS}
                        cols={TEXTAREA_COLS}
                    ></textarea>
                </div>
            </div>
        );
    }

    protected async onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const inputElement = document.getElementById("split-config-input") as HTMLTextAreaElement;
        let configObject;
        try {
            configObject = JSON.parse(inputElement.value) as unknown;
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
            output = await createSplitsXml(configObject as Config);
        }
        catch (e) {
            console.error(e);
            alert("Failed to create splits. The error has been logged to console.error");
            return;
        }
        finally {
            submitButton.disabled = false;
        }

        const outputElement = document.getElementById("split-result") as HTMLTextAreaElement;
        outputElement.value = output;
    }

    protected onDownload(): void {
        const outputElement = document.getElementById("split-result") as HTMLTextAreaElement;
        const output = outputElement.value;
        const outBlob = new Blob([output]);
        saveAs(outBlob, "splits.lss");
    }
}
