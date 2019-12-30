import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewComponent } from './view/view.component';
import { ConfigComponent } from './config/config.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'config', component: ConfigComponent},
    {path: 'view', component: ViewComponent},
    {path: '**', redirectTo: 'home'}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
