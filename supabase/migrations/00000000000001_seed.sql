-- 7.a Cabinet de démonstration (rattachement auto du premier utilisateur)
-- UUID fixe référencé par handle_new_user() (section 6)
insert into public.cabinets (id, name, orias)
values ('00000000-0000-0000-0000-0000000000c1', 'Cabinet de démonstration', null)
on conflict (id) do nothing;

-- Rattache rétroactivement tout profil déjà existant sans cabinet
update public.profiles
   set cabinet_id = '00000000-0000-0000-0000-0000000000c1'
 where cabinet_id is null;

-- 7.b Gamme de fonds
insert into public.funds
  (slug, name, manager, strategy, bucket, pacing, min_ticket, closing_label, closing_date, risk_score, esg_score, target_multiple, target_gross_irr, sort_order)
values
  ('merieux-innovation-ii','PC Feeder Mérieux Innovation II','Mérieux Equity Partners','Innovation / Accélération capital','satellite','innovation',100000,'Sept. 2026','2026-09-30',5,1,2.60,0.220,1),
  ('pc-european-semiconductor','Private Corner Wealth European Semiconductor','Ardian','Buyout','coeur','buyout',100000,'Oct. 2026','2026-10-31',5,0,2.20,0.180,2),
  ('pc-credit-yield','Private Corner Credit Yield','CVC & General Atlantic','Dette privée','defensif','credit',100000,'Nov. 2026','2026-11-30',2,0,1.50,0.100,3),
  ('pc-buyout-eqt','Private Corner Buyout EQT Strategy','EQT','Buyout','coeur','buyout',100000,'Déc. 2026','2026-12-31',4,1,2.10,0.170,4),
  ('pc-keensight-nova-vii','PC Feeder Keensight Nova VII','Keensight Capital','Growth / Buyout','croissance','growth',100000,'Déc. 2026','2026-12-31',4,0,2.40,0.200,5),
  ('tikehau-decarbonization-ii','Tikehau Decarbonization Fund II – Feeder','Tikehau Capital','Growth Buyout','croissance','growth',100000,'Déc. 2026','2026-12-31',4,2,2.00,0.160,6),
  ('blue-owl-gp-stakes','Blue Owl GP Stakes Strategy','Blue Owl Capital','GP Stakes','coeur','gpstakes',100000,'Mars 2027','2027-03-31',3,0,2.00,0.150,7),
  ('pc-secondary-2026','Private Corner Secondary Fund 2026','Committed Advisors','Secondaire Growth Buyout','coeur','secondary',100000,'Juin 2027','2027-06-30',2,0,1.70,0.150,8),
  ('european-midmarket-opportunities','European MidMarket Opportunities','PAI Partners, Keensight Capital, Eurazeo, General Atlantic','Buyout','coeur','buyout',25000,'Juin 2027','2027-06-30',3,0,2.10,0.170,9),
  ('pc-wealth-buyout-2026','Private Corner Wealth Buyout 2026','Ardian','Buyout','coeur','buyout',100000,'Mars 2028','2028-03-31',3,0,2.10,0.170,10),
  ('us-midcap-buyout','US MidCap Buyout Strategies','Neuberger (sélection de gérants)','Buyout','coeur','buyout',100000,'Mars 2028','2028-03-31',3,0,2.20,0.180,11),
  ('meridiam-global-infrastructure','Meridiam Global Infrastructure Strategies','Meridiam','Infrastructure Core / Core+','defensif','infra',100000,'En continu',null,2,2,1.80,0.110,12)
on conflict (slug) do update set
  name = excluded.name, manager = excluded.manager, strategy = excluded.strategy,
  bucket = excluded.bucket, pacing = excluded.pacing, min_ticket = excluded.min_ticket,
  closing_label = excluded.closing_label, closing_date = excluded.closing_date,
  risk_score = excluded.risk_score, esg_score = excluded.esg_score,
  target_multiple = excluded.target_multiple, target_gross_irr = excluded.target_gross_irr,
  sort_order = excluded.sort_order;
