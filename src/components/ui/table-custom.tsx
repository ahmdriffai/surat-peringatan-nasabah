import clsx from "clsx";

type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  keyExtractor?: (row: T, index: number) => string;
  emptyMessage?: string;
};

export default function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
}: TableProps<T>) {
  return (
    <div className="w-full overflow-scroll rounded-2xl border border-gray-200 bg-white">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className={clsx(
                  "px-6 py-4 text-left font-semibold text-gray-500",
                  "text-xs uppercase tracking-wide",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}

          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor?.(row, rowIndex) ?? rowIndex}
              className="border-t border-gray-100 transition hover:bg-gray-50"
            >
              {columns.map((column) => {
                const value =
                  typeof column.accessor === "function"
                    ? column.accessor(row)
                    : row[column.accessor];

                return (
                  <td
                    key={column.header}
                    className={clsx("px-6 py-4 text-gray-700", column.className)}
                  >
                    {value as React.ReactNode}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
