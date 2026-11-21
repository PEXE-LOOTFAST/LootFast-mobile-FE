import type { ReactNode } from 'react';

import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading-state';

/** Phần của kết quả TanStack Query mà QueryBoundary cần. */
type QueryState<T> = {
  data: T | undefined;
  error: unknown;
  isPending: boolean;
  isError: boolean;
  isRefetching: boolean;
  refetch: () => unknown;
};

type QueryListEmptyProps = {
  query: Omit<QueryState<unknown>, 'data'>;
  errorMessage: (error: unknown) => string;
  loadingLabel?: string;
  /** Khung xương thay cho vòng xoay lúc tải lần đầu, dựng theo hình dáng mục trong danh sách. */
  loading?: ReactNode;
  /** Tải xong mà không có mục nào. */
  empty: ReactNode;
};

/**
 * `ListEmptyComponent` cho danh sách lấy từ API. FlatList chỉ hiện nó khi chưa có mục nào, nên
 * một chỗ phủ đủ ba trường hợp: đang tải lần đầu, lỗi (kèm Thử lại) và thật sự rỗng.
 */
export function QueryListEmpty({
  query,
  errorMessage,
  loadingLabel,
  loading,
  empty,
}: QueryListEmptyProps) {
  if (query.isPending) return loading ? <>{loading}</> : <LoadingState label={loadingLabel} />;

  if (query.isError) {
    return (
      <ErrorState
        message={errorMessage(query.error)}
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    );
  }

  return <>{empty}</>;
}

type QueryBoundaryProps<T> = {
  query: QueryState<T>;
  /** Dịch lỗi API sang câu tiếng Việt cho người dùng. */
  errorMessage: (error: unknown) => string;
  loadingLabel?: string;
  /** Dữ liệu tải xong nhưng không có gì để hiện (danh sách rỗng). */
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
};

/**
 * Bốn trạng thái của một truy vấn — đang tải, lỗi (kèm Thử lại), rỗng, có dữ liệu — viết một lần
 * thay vì lặp chuỗi `isPending ? … : isError ? … : …` ở mỗi màn.
 */
export function QueryBoundary<T>({
  query,
  errorMessage,
  loadingLabel,
  isEmpty,
  empty = null,
  children,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <LoadingState label={loadingLabel} />;

  if (query.isError || query.data === undefined) {
    return (
      <ErrorState
        message={errorMessage(query.error)}
        onRetry={() => void query.refetch()}
        retrying={query.isRefetching}
      />
    );
  }

  if (isEmpty?.(query.data)) return <>{empty}</>;

  return <>{children(query.data)}</>;
}
