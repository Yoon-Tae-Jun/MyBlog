import React from "react";
import "./State.css";

/** 데이터를 기다리는 동안 실제 레이아웃과 비슷한 형태를 보여준다. */
export function CardSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-grid" aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
          <div className="skeleton-tags">
            <span className="skeleton-tag" />
            <span className="skeleton-tag" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TextSkeleton({ lines = 6 }) {
  return (
    <div className="skeleton-text" aria-busy="true" aria-label="불러오는 중">
      {Array.from({ length: lines }).map((_, i) => (
        <div className={`skeleton-line ${i % 3 === 2 ? "short" : ""}`} key={i} />
      ))}
    </div>
  );
}

export function ErrorState({ onRetry, message }) {
  return (
    <div className="state-box" role="alert">
      <p className="state-title">내용을 불러오지 못했습니다</p>
      <p className="state-desc">
        {message || "잠시 후 다시 시도해 주세요. 문제가 계속되면 새로고침해 주세요."}
      </p>
      {onRetry && (
        <button className="state-button" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="state-box">
      <p className="state-desc">{message || "표시할 내용이 없습니다."}</p>
    </div>
  );
}
