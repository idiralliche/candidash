import { Plus, Building2, Globe, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/use-companies';
import { FormDialog } from '@/components/form-dialog';
import { CompanyForm } from '@/components/company-form';

export function CompaniesPage() {
  const { companies, isLoading } = useCompanies();

  return (
    <div className="space-y-8 pt-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          Entreprises
        </h1>

        {/* Using the generic FormDialog component */}
        <FormDialog
          title="Nouvelle Entreprise"
          description="Ajoutez une entreprise pour y associer des contacts et des opportunités."
          trigger={
            <Button className="bg-primary hover:bg-[#e84232] text-white">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une entreprise
            </Button>
          }
        >
          {(close) => (
            <CompanyForm onSuccess={close} />
          )}
        </FormDialog>

      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-xl bg-[#16181d] p-8 shadow-lg">
              <div className="mb-4 h-[72px] w-[72px] rounded-xl bg-white/5" />
              <Skeleton className="mb-3 h-6 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-1/2 bg-white/10" />
            </div>
          ))
        ) : companies?.length === 0 ? (
          // Empty State
          <div className="col-span-full py-20 text-center text-muted-foreground">
            Aucune entreprise trouvée. Commencez par en ajouter une !
          </div>
        ) : (
          // Data Grid
          companies?.map((company) => (
            <Card
              key={company.id}
              className="flex flex-col items-center border-none bg-[#16181d] p-6 text-center shadow-lg transition-transform hover:-translate-y-1"
            >
              <CardHeader className="p-0 pb-4">
                <div className="mb-4 inline-flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl font-bold text-white">
                  {company.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-0 text-sm text-muted-foreground">
                {company.industry && (
                  <p className="font-medium text-primary">
                    {company.industry}
                  </p>
                )}

                {company.headquarters && (
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{company.headquarters}</span>
                  </div>
                )}

                {company.website && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Globe className="h-4 w-4" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary hover:underline"
                    >
                      Site web
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
