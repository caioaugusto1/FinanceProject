create table User(
	IdUser char(38) not null primary key, 
    Name varchar(50) not null, 
    UserName char(38) not null, 
    Password char(38) not null, 
    Available boolean
);

create table Cost(
	IdCost char(38) not null primary key, 
	Name varchar(50) not null, 
	Description varchar(50) not null,
    IdUser char(38) not null, 
	foreign key fk_user(IdUser) references User(IdUser)
); 

create table Image(
	IdImage char(38) not null primary key,
    Date date not null
);

create table PaymentType 
(
	IdPaymentType char(38) not null primary key,
	Name varchar(50) not null,
	Description varchar(50) null, 
    Available boolean,
    IdUser char(38) not null,
    foreign key fk_userPaymentType(IdUser) references User(IdUser)
);

create table Payment(
	IdPayment char(38) not null primary key, 
    Name varchar(50) not null, 
    Description varchar(50) null, 
    Value decimal(10,2) not null,
    Date date not null, 
    IdPaymentType char(38) not null,
    IdImage char(38) not null,
    foreign key fk_paymentType(IdPaymentType) references PaymentType(IdPaymentType), 
    foreign key fk_image(IdImage) references Image(IdImage)
);

create table PaymentCost(
	IdPayment char(38) not null,
    IdCost char(38) not null, 
    foreign key fk_payment(IdPayment) references Payment(IdPayment), 
    foreign key fk_cost(IdCost) references Cost(IdCost)
)



