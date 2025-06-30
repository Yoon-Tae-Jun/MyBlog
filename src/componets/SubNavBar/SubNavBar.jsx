import React from "react";
import "./SubNavBar.css"
const SubNavBar = ({ tabs, currentTab, setCurrentTab, currentPage }) => (
    <div className="subNavBar-container">
        <div className="subNavBar-content-wrapper">
        <div className="current-content"> 
            <div className="current-tab">{currentTab}</div>
            <div className="current-path">{currentPage} - {currentTab} </div>
        </div>
        <div className="tab-container">
            {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`tab-button ${currentTab === tab ? "active" : ""}`}
            >
                {tab}
            </button>
            ))}
        </div>
        </div>
    </div>
);
export default SubNavBar;