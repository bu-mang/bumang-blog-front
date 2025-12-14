"use client";

import React, { Component, ReactNode } from "react";

interface EditorErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  emergencySave?: () => Promise<void>;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface EditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isSaving: boolean;
  savedSuccessfully: boolean;
}

/**
 * Editor Error Boundary
 *
 * 에디터에서 에러 발생 시:
 * 1. 현재 작성 중인 내용을 긴급 저장
 * 2. 사용자에게 에러 UI 표시
 * 3. 복구 옵션 제공
 *
 * @example
 * <EditorErrorBoundary emergencySave={emergencySave}>
 *   <Editor />
 * </EditorErrorBoundary>
 */
export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isSaving: false,
      savedSuccessfully: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EditorErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Editor Error Boundary caught an error:", error, errorInfo);

    // 에러 콜백 호출
    this.props.onError?.(error, errorInfo);

    // 긴급 저장 시도
    if (this.props.emergencySave) {
      this.setState({ isSaving: true });

      try {
        await this.props.emergencySave();
        this.setState({
          savedSuccessfully: true,
          isSaving: false,
        });
        console.log("Emergency save successful");
      } catch (saveError) {
        console.error("Emergency save failed:", saveError);
        this.setState({
          savedSuccessfully: false,
          isSaving: false,
        });
      }
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      isSaving: false,
      savedSuccessfully: false,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // 기본 fallback UI
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 p-8">
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950">
            <h2 className="mb-2 text-xl font-semibold text-red-900 dark:text-red-100">
              에디터 오류가 발생했습니다
            </h2>

            <p className="mb-4 text-sm text-red-700 dark:text-red-300">
              {this.state.error.message}
            </p>

            {this.state.isSaving && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                <span>작성 중인 글을 저장하는 중...</span>
              </div>
            )}

            {this.state.savedSuccessfully && (
              <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-800 dark:bg-green-900 dark:text-green-200">
                ✓ 작성 중인 글이 임시저장되었습니다.
              </div>
            )}

            {!this.state.isSaving && !this.state.savedSuccessfully && (
              <div className="mb-4 rounded bg-yellow-100 p-3 text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                ⚠ 임시저장에 실패했을 수 있습니다.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
              >
                다시 시도
              </button>

              <button
                onClick={() => window.location.reload()}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                페이지 새로고침
              </button>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400">
                에러 상세 정보
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs dark:bg-gray-800">
                {this.state.error.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
