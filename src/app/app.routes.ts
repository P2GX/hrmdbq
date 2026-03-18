import { Routes } from "@angular/router";

import { Setup } from "./pages/setup/setup";
import { AnnotationTable } from "./pages/annots/annotations";
import { CurationWidget } from "./pages/curate/curate";
import { About } from "./pages/about/about";

export const routes: Routes = [
    { path: 'setup', component: Setup},
    { path: 'annots', component: AnnotationTable},
    { path: 'curate', component: CurationWidget},
    { path: 'about', component: About},
    { path: '', redirectTo: '/setup', pathMatch: 'full'}
];
