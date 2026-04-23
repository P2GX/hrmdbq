import { Routes } from "@angular/router";

import { Setup } from "./pages/setup/setup";
import { AnnotationTable } from "./pages/annots/annotations";
import { CurationWidget } from "./pages/curate/curate";
import { About } from "./pages/about/about";
import { ViewWidget } from "./pages/view/view";
import { StatusWidget } from "./pages/status/status"

export const routes: Routes = [
    { path: 'setup', component: Setup},
    { path: 'annots', component: AnnotationTable},
    { path: 'curate', component: CurationWidget},
    { path: 'curate/:id', component: CurationWidget },
    { path: 'view', component: ViewWidget},
    { path: 'view/:id', component: ViewWidget },
     { path: 'status', component: StatusWidget},
    { path: 'about', component: About},
    { path: '', redirectTo: '/setup', pathMatch: 'full'}
];
