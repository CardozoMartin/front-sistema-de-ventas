import type { ReactNode } from "react";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { getVisiblePages } from "./paginationUtils";



interface TablePaginationProps {

  currentPage: number;

  totalPages: number;

  onPageChange: (page: number) => void;

  summary?: ReactNode;

  className?: string;

}



const TablePagination = ({

  currentPage,

  totalPages,

  onPageChange,

  summary,

  className = "",

}: TablePaginationProps) => {

  if (totalPages <= 1) {

    return summary ? (

      <div className={`text-sm text-neutral-500 ${className}`}>{summary}</div>

    ) : null;

  }



  const visible = getVisiblePages(currentPage, totalPages);



  return (

    <div

      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}

    >

      {summary && <div className="shrink-0 text-sm text-neutral-500">{summary}</div>}



      <nav

        className="flex flex-wrap items-center gap-1 sm:flex-nowrap sm:justify-end"

        aria-label="Paginación"

      >

        <button

          type="button"

          onClick={() => onPageChange(currentPage - 1)}

          disabled={currentPage <= 1}

          className="btn-secondary inline-flex shrink-0 px-2.5 py-1.5 disabled:opacity-40"

          aria-label="Página anterior"

        >

          <ChevronLeft className="h-4 w-4" />

          <span className="hidden sm:inline">Ant.</span>

        </button>



        <span className="shrink-0 px-1 text-sm tabular-nums text-neutral-600">

          {currentPage} / {totalPages}

        </span>



        <div className="flex max-w-[min(100%,14rem)] items-center gap-0.5 overflow-x-auto">

          {visible.map((token, idx) =>

            token === "ellipsis" ? (

              <span

                key={`e-${idx}`}

                className="flex h-7 w-7 items-center justify-center text-neutral-400"

                aria-hidden

              >

                <MoreHorizontal className="h-4 w-4" />

              </span>

            ) : (

              <button

                key={token}

                type="button"

                onClick={() => onPageChange(token)}

                aria-label={`Página ${token}`}

                aria-current={token === currentPage ? "page" : undefined}

                className={`h-7 min-w-[1.75rem] shrink-0 rounded-md px-1 text-xs font-medium transition-colors ${

                  token === currentPage

                    ? "bg-neutral-900 text-white"

                    : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"

                }`}

              >

                {token}

              </button>

            )

          )}

        </div>



        <button

          type="button"

          onClick={() => onPageChange(currentPage + 1)}

          disabled={currentPage >= totalPages}

          className="btn-secondary inline-flex shrink-0 px-2.5 py-1.5 disabled:opacity-40"

          aria-label="Página siguiente"

        >

          <span className="hidden sm:inline">Sig.</span>

          <ChevronRight className="h-4 w-4" />

        </button>

      </nav>

    </div>

  );

};



export default TablePagination;

