import { useState, useMemo } from 'react';
import { useAudits } from '../../hooks/useAudit';
import { useUsers } from '../../hooks/useUsers';
import { PageHeader } from '../../components/ui/PageHeader';
import TablePagination from '../../components/ui/TablePagination';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Activity, Clock, Database, Tag, Info, User, FileText, ChevronDown, ChevronRight, Search } from 'lucide-react';
import type { Audit } from '../../services/types';

const actionIcons: Record<string, React.ElementType> = {
  CREATE: Database,
  UPDATE: Activity,
  DELETE: Tag,
  LOGIN: User,
  LOGOUT: User,
};

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-neutral-100 text-neutral-700',
};

const AuditRow = ({ audit, userName }: { audit: Audit; userName: string }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = actionIcons[audit.action] || Info;
  const colorClass = actionColors[audit.action] || 'bg-neutral-100 text-neutral-700';

  const hasChanges = audit.changes && (audit.changes.before || audit.changes.after);

  return (
    <>
      <tr className="hover:bg-neutral-50/50">
        <td className="whitespace-nowrap px-4 py-3 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            {format(new Date(audit.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-neutral-900">{userName}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${colorClass}`}>
            <Icon size={12} />
            {audit.action}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-neutral-900 font-medium">
          {audit.entity}
        </td>
        <td className="px-4 py-3 text-sm text-neutral-600 max-w-md truncate">
          {audit.description || '-'}
        </td>
        <td className="px-4 py-3 text-right">
          {hasChanges && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-accent-600 hover:bg-accent-50"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Cambios
            </button>
          )}
        </td>
      </tr>
      {expanded && hasChanges && (
        <tr className="bg-neutral-50/50">
          <td colSpan={6} className="p-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-200 bg-white p-4">
              {audit.changes?.before && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Valor Anterior</h4>
                  <pre className="overflow-x-auto rounded bg-neutral-50 p-3 text-xs text-neutral-700">
                    {JSON.stringify(audit.changes.before, null, 2)}
                  </pre>
                </div>
              )}
              {audit.changes?.after && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Nuevo Valor</h4>
                  <pre className="overflow-x-auto rounded bg-neutral-50 p-3 text-xs text-neutral-700">
                    {JSON.stringify(audit.changes.after, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const AuditLogsPage = () => {
  // Removed 3-second polling as it causes massive lag with thousands of records
  const { data: auditsData, isLoading, error } = useAudits();
  const { data: usersData } = useUsers();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const audits = Array.isArray(auditsData) ? auditsData : (auditsData as any)?.data || [];
  const users = Array.isArray(usersData) ? usersData : (usersData as any)?.data || [];

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u: any) => {
      map.set(u.id || u._id, u.name);
    });
    return map;
  }, [users]);

  const filteredAudits = useMemo(() => {
    return audits.filter((audit: Audit) => {
      const matchAction = actionFilter === 'ALL' || audit.action === actionFilter;
      const userName = userMap.get(audit.user) || 'Usuario Desconocido';
      
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        audit.entity.toLowerCase().includes(searchLower) ||
        (audit.description || '').toLowerCase().includes(searchLower) ||
        userName.toLowerCase().includes(searchLower);

      return matchAction && matchSearch;
    });
  }, [audits, actionFilter, searchTerm, userMap]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [actionFilter, searchTerm]);

  const totalPages = Math.ceil(filteredAudits.length / itemsPerPage);
  const paginatedAudits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAudits.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAudits, currentPage, itemsPerPage]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-12">
        <div className="rounded-full bg-red-100 p-3 text-red-600">
          <Activity size={24} />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-medium text-neutral-900">Error al cargar registros</h3>
          <p className="mt-1 text-sm text-neutral-500">No se pudieron obtener los logs de auditoría.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-5 sm:p-6">
      <PageHeader
        title="Registro de Actividad"
        description="Monitoreo en tiempo real de las acciones del sistema"
        actions={
          <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-1 shadow-sm">
            <FileText className="h-4 w-4 text-neutral-400 ml-2" />
            <span className="text-sm font-medium text-neutral-700 mr-2">{audits.length} Registros</span>
          </div>
        }
      />

      <div className="app-card overflow-hidden">
        <div className="border-b border-neutral-200 bg-white p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por usuario, entidad o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">Filtro:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="input-field py-1.5"
              >
                <option value="ALL">Todas las acciones</option>
                <option value="CREATE">Creación</option>
                <option value="UPDATE">Modificación</option>
                <option value="DELETE">Eliminación</option>
                <option value="LOGIN">Logins</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="bg-neutral-50/50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha y Hora</th>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Acción</th>
                <th className="px-4 py-3 font-medium">Módulo</th>
                <th className="px-4 py-3 font-medium">Detalle</th>
                <th className="px-4 py-3 font-medium text-right">Diferencias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {paginatedAudits.length > 0 ? (
                paginatedAudits.map((audit: Audit) => (
                  <AuditRow 
                    key={audit.id} 
                    audit={audit} 
                    userName={userMap.get(audit.user) || 'Desconocido'} 
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">
                    No se encontraron registros de actividad con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {filteredAudits.length > 0 && (
          <div className="border-t border-neutral-200 bg-white p-4">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              summary={
                <span>
                  Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                  {Math.min(currentPage * itemsPerPage, filteredAudits.length)} de{' '}
                  {filteredAudits.length} registros
                </span>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;
