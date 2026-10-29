// Import Component to define an Angular component.
import { Component } from '@angular/core';

// Import RouterLink to enable navigation between application routes.
import { RouterLink } from '@angular/router';

// Configure the Forbidden component.
@Component({
  // Name used to reference this component in Angular templates.
  selector: 'app-forbidden',

  // Makes the component independent of an Angular NgModule.
  standalone: true,

  // Import RouterLink to enable navigation from the error page.
  imports: [RouterLink],

  // Inline HTML template for the 403 Access Denied page.
  template: `
    <!-- Full-screen container for the access denied page -->
    <main
      class="flex min-h-screen items-center justify-center bg-[#090909] px-5 text-white"
    >
      <!-- Centered card containing the error message and navigation links -->
      <section
        class="w-full max-w-lg rounded-3xl border border-white/10 bg-[#141414] p-8 text-center sm:p-12"
      >
        <!-- Visual indicator that access has been denied -->
        <div
          class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-4xl font-bold text-red-400"
        >
          !
        </div>

        <!-- Display the HTTP 403 Forbidden error code -->
        <p
          class="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#ff6b00]"
        >
          Error 403
        </p>

        <!-- Main heading informing the user that access is denied -->
        <h1 class="mt-3 text-3xl font-black sm:text-4xl">
          Access Denied
        </h1>

        <!-- Explain why the requested page cannot be accessed -->
        <p class="mt-4 text-sm leading-7 text-gray-400">
          You are not allowed to access this page.
          Only administrators can access the Admin Dashboard.
        </p>

        <!-- Navigate to the application's home page -->
        <a
          routerLink="/"
          class="mt-8 inline-flex rounded-full bg-[#ff6b00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ff8126]"
        >
          Go to Dashboard
        </a>

        <!-- Provide an option to navigate to the login page -->
        <a
          routerLink="/login"
          class="ml-3 inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-[#ff8733]"
        >
          Log in
        </a>
      </section>
    </main>
  `
})

// Export the component so it can be used in Angular routes.
export class Forbidden {}