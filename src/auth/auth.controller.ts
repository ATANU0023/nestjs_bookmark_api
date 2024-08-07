import { Body, Controller, HttpCode, HttpStatus, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    //create two end points one for the login and another for the signup

    @Post('signup')
    signup(@Body() dto: AuthDto) {
        console.log(
            {
                dto,
            }
        );
        return this.authService.signup(dto)
    }

    
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() dto: AuthDto) {
        return this.authService.signin(dto)
    }

}