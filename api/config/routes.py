def register():
    """
        declare menuItems as follows: 'module.PluralNameClass@endpoint': 'route'
        returns: dict
    """
    return {
        'users.Users@users_url': '/user',
        'users.UsersManager@users_manager_url': '/users|/users/<int:user_id>',
        'users.Session@login_url': '/login',
        'users.Roles@roles_url': '/roles',
        'users.Permissions@permissions_url': '/permissions',
        'users.UserTokens@user_tokens_url': '/user-tokens|/user-tokens/<user_token>',
        'users.Activate@user_activate_url': '/account/activate-pass',
        'users.Audit@audit_url': '/audit|/audit/<int:user_id>',
        'users.UserPasswords@user_passwords_url': '/users/reset-password',
        'users.Messages@messages_url': '/messages|/messages/<int:message_id>',

        'company.Company@company_url': '/company',

        'meta.Countries@country_url': '/meta/countries',
        'meta.SourceProjects@source_projects_url': '/meta/source-projects',
        'meta.ProjectTypes@project_types_url': '/meta/project-types',
        'meta.Distributors@distributors_url': '/meta/distributors',
        'meta.Rates@rates_url': '/meta/rates',
        'meta.Transformers@transformers_url': '/meta/transformers',
        'meta.TrCapacities@tr_capacities_url': '/meta/tr-capacities',
        'meta.Phases@phases_url': '/meta/phases',
        'meta.Tensions@tensions_url': '/meta/tensions',
        'meta.PanelModels@panel_models_url': '/meta/panel-models',
        'meta.InverterModels@inverter_models_url': '/meta/inverter-models',
        'meta.DocumentCategories@document_categories_url': '/meta/document-categories',

        'customers.Customers@customers_url': '/customers|/customers/<int:customer_id>',
        'customers.CustomerProjects@customer_projects_url': '/customers/projects|/customers/projects/<int:project_id>',
        'customers.CustomerInstallations@customer_installations_url': '/customers/installations||/customers/installations/<int:installation_id>',
        'customers.CustomerDocuments@customer_documents_url': '/customers/documents|/customers/documents/<int:installation_id>',
        'customers.EGauge@egauge_url': '/egauge/<realm>',

        'shared.Email@emails_url': '/email|/email/<string:action>',
        'shared.HtmlToPdf@html_to_pdf_url': '/to-pdf',
        'shared.Widgets@widgets_url': '/widgets',
        'shared.RunWidget@run_widgets_url': '/widgets/<string:widget_name>',
    }


no_permissions = [
    'views.users.Session',
    'views.users.Users',
    'views.users.UserTokens',
    'views.users.Permissions',
    'views.users.Activate',
]

default_access = {
    'views.company.Company': ['read'],
    'views.meta.Countries': ['read'],
    'views.meta.SourceProjects': ['read'],
    'views.meta.ProjectTypes': ['read'],
    'views.meta.Distributors': ['read'],
    'views.meta.Rates': ['read'],
    'views.meta.Transformers': ['read'],
    'views.meta.TrCapacities': ['read'],
    'views.meta.Tensions': ['read'],
    'views.meta.PanelModels': ['read'],
    'views.meta.InverterModels': ['read'],
    'views.meta.DocumentCategories': ['read'],
    'views.meta.DocumentTypes': ['read'],
}
