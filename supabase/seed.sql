
-- Seed data for AFIX

insert into services (key, name, description)
values
('remodelacao', 'Remodelação', 'Transforme o seu espaço com remodelações completas')
on conflict (key) do nothing;

insert into services (key, name, description)
values
('construcao_civil', 'Construção Civil', 'Projetos de construção civil de qualidade')
on conflict (key) do nothing;

insert into services (key, name, description)
values
('pintura', 'Pintura', 'Serviços de pintura interior e exterior')
on conflict (key) do nothing;

-- sample users
insert into profiles (email, full_name, role)
values
('cliente@example.com', 'Cliente Exemplo', 'client')
on conflict (email) do nothing;

insert into profiles (email, full_name, role)
values
('franqueador@example.com', 'Franqueador Exemplo', 'franqueador')
on conflict (email) do nothing;

insert into profiles (email, full_name, role)
values
('franqueado@example.com', 'Franqueado Exemplo', 'franqueado')
on conflict (email) do nothing;

insert into profiles (email, full_name, role)
values
('admin@example.com', 'Admin Exemplo', 'admin')
on conflict (email) do nothing;
